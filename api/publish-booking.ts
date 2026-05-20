/// <reference types="node" />

export const config = {
  runtime: "nodejs",
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  const pinataJwt = process.env.PINATA_JWT

  if (!pinataJwt) {
    return new Response(
      JSON.stringify({ error: "Missing PINATA_JWT environment variable" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  try {
    const booking = await req.json()

    const pinataBody = {
      pinataContent: booking,
      pinataMetadata: {
        name: `loove-booking-${booking.bookingId || Date.now()}`,
      },
    }

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: JSON.stringify(pinataBody),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(
        JSON.stringify({
          error: "Pinata upload failed",
          details: errorText,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const data = await response.json()

    return new Response(
      JSON.stringify({
        cid: data.IpfsHash,
        ipfsUri: `ipfs://${data.IpfsHash}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Unexpected error",
        details: String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}