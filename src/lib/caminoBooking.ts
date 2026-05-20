import { ethers } from "ethers"

import type { LooveBookingProof } from "./booking"
import {
  publishBookingToIpfs,
  type IpfsPublishResult,
} from "./ipfsBooking"

const BTR_CONTENT_REGISTRY =
  "0x17B8b74E1D0C50878ab8Bf5642b4E3E8702D178a"

const ABI_CONTENT = [
  "function createContent(string uri) external",
  "function getContent(uint256 id) external view returns (tuple(uint256 id, address author, string uri, bool active))",
  "event ContentCreated(uint256 indexed id, address indexed author, string uri)",
]

export type CaminoBookingResult = {
  ipfs: IpfsPublishResult
  ipfsUri: string
  txHash: string
  contentId: string
}

export async function registerBookingOnCamino(ipfsUri: string) {
  const ethereum = (window as any).ethereum

  if (!ethereum) {
    throw new Error("MetaMask non trovato")
  }

  const provider = new ethers.BrowserProvider(ethereum)

  await provider.send("eth_requestAccounts", [])

  const signer = await provider.getSigner()

  const contract = new ethers.Contract(
    BTR_CONTENT_REGISTRY,
    ABI_CONTENT,
    signer
  )

  const tx = await contract.createContent(ipfsUri)

  const receipt = await tx.wait()

  let contentId = ""

  for (const log of receipt?.logs || []) {
    try {
      const parsed = contract.interface.parseLog({
        topics: log.topics,
        data: log.data,
      })

      if (parsed?.name === "ContentCreated") {
        contentId = parsed.args.id.toString()
      }
    } catch {
      // ignore unrelated logs
    }
  }

  return {
    txHash: tx.hash,
    contentId,
  }
}

export async function createBookingProof(
  bookingProof: LooveBookingProof
): Promise<CaminoBookingResult> {
  const ipfs = await publishBookingToIpfs(bookingProof)

  const camino = await registerBookingOnCamino(ipfs.ipfsUri)

  return {
    ipfs,
    ipfsUri: ipfs.ipfsUri,
    txHash: camino.txHash,
    contentId: camino.contentId,
  }
}