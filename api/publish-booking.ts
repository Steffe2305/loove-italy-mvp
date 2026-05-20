/// <reference types="node" />

export const config = {
  runtime: "nodejs",
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const pinataJwt = process.env.PINATA_JWT

  if (!pinataJwt) {
    return res.status(500).json({
      error: "Missing PINATA_JWT environment variable",
    })
  }

  try {
    const booking = req.body

    const pinataBody = {
      pinataContent: booking,
      pinataMetadata: {
        name: `loove-booking-${booking.bookingId || Date.now()}`,
      },
    }

    const controller = new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, 15000)

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: JSON.stringify(pinataBody),
        signal: controller.signal,
      }
    )

    clearTimeout(timeout)

    if (!response.ok) {
      const errorText = await response.text()

      return res.status(500).json({
        error: "Pinata upload failed",
        details: errorText,
      })
    }

    const data = await response.json()

    return res.status(200).json({
      cid: data.IpfsHash,
      ipfsUri: `ipfs://${data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    })
  } catch (error) {
    return res.status(500).json({
      error: "Unexpected error",
      details: String(error),
    })
  }
}