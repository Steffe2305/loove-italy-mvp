import type { LooveBookingProof } from "./booking"

export type IpfsPublishResult = {
  cid: string
  ipfsUri: string
  gatewayUrl: string
}

export async function publishBookingToIpfs(
  bookingProof: LooveBookingProof
): Promise<IpfsPublishResult> {
  const controller = new AbortController()

  const timeout = setTimeout(() => {
    controller.abort()
  }, 15000)

  try {
    const response = await fetch("/api/publish-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingProof),
      signal: controller.signal,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)

      throw new Error(
        error?.details || error?.error || "Errore pubblicazione IPFS"
      )
    }

    return response.json()
  } finally {
    clearTimeout(timeout)
  }
}