import { ethers } from "ethers"

declare global {
  interface Window {
    ethereum?: any;
  }
}

export type CaminoBookingProofResult = {
  txHash: string
  contentId?: number
}

const BTR_CONTENT_REGISTRY =
  "0x17B8b74E1D0C50878ab8Bf5642b4E3E8702D178a"

const ABI_CONTENT = [
  "function createContent(string uri) external",
  "event ContentCreated(uint256 indexed id, address indexed author, string uri)",
]

export async function registerBookingProofOnCamino(
  ipfsUri: string
): Promise<CaminoBookingProofResult> {
  const ethereum = window.ethereum

  if (!ethereum) {
    throw new Error("MetaMask non trovato")
  }

  const provider = new ethers.BrowserProvider(ethereum)
  const signer = await provider.getSigner()

  const contract = new ethers.Contract(
    BTR_CONTENT_REGISTRY,
    ABI_CONTENT,
    signer
  )

  await contract.createContent.staticCall(ipfsUri)

  const tx = await contract.createContent(ipfsUri)
  const receipt = await tx.wait()

  let contentId: number | undefined

  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log)

      if (parsed?.name === "ContentCreated") {
        contentId = Number(parsed.args.id)
        break
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