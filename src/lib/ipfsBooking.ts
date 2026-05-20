import type { LooveBookingProof } from "./booking"

export type IpfsPublishResult = {
  cid: string
  ipfsUri: string
  gatewayUrl: string
}

export async function publishBookingToIpfs(
  bookingProof: LooveBookingProof
): Promise<IpfsPublishResult> {
  const response = await fetch("/api/publish-booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingProof),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)

    throw new Error(
      error?.details || error?.error || "Errore pubblicazione IPFS"
    )
  }

  return response.json()
}