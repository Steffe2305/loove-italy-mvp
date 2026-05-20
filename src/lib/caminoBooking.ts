import { ethers } from "ethers";

const BTR_CONTENT_REGISTRY =
  "0x17B8b74E1D0C50878ab8Bf5642b4E3E8702D178a";

const ABI_CONTENT = [
  "function createContent(string uri) external",
  "function getContent(uint256 id) external view returns (tuple(uint256 id, address author, string uri, bool active))",
  "event ContentCreated(uint256 indexed id, address indexed author, string uri)"
];

export type CaminoBookingPayload = {
  type: string;
  version: string;
  createdAt: string;

  hotel: {
    name: string;
    destination: string;
    room: string;
  };

  guest: {
    name: string;
    email: string;
  };

  booking: {
    checkIn: string;
    checkOut: string;
    guests: number;
  };

  total: {
    amount: number;
    currency: string;
  };

  source: string;
  status: string;
};

export async function publishBookingToIPFS(
  payload: CaminoBookingPayload
): Promise<string> {
  const response = await fetch("/api/publish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Errore pubblicazione IPFS");
  }

  const data = await response.json();

  const uri =
    data.uri ||
    data.ipfsUri ||
    data.url ||
    (data.IpfsHash ? `ipfs://${data.IpfsHash}` : "");

  if (!uri) {
    throw new Error("URI IPFS non trovato");
  }

  return uri;
}

export async function registerBookingOnCamino(uri: string) {
  const ethereum = (window as any).ethereum;

  if (!ethereum) {
    throw new Error("MetaMask non trovato");
  }

  const provider = new ethers.BrowserProvider(ethereum);

  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();

  const contract = new ethers.Contract(
    BTR_CONTENT_REGISTRY,
    ABI_CONTENT,
    signer
  );

  const tx = await contract.createContent(uri);

  const receipt = await tx.wait();

  let contentId = "";

  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({
        topics: log.topics,
        data: log.data
      });

      if (parsed?.name === "ContentCreated") {
        contentId = parsed.args.id.toString();
      }
    } catch {
      // ignore unrelated logs
    }
  }

  return {
    txHash: tx.hash,
    contentId
  };
}

export async function createBookingProof(
  payload: CaminoBookingPayload
) {
  const ipfsUri = await publishBookingToIPFS(payload);

  const camino = await registerBookingOnCamino(ipfsUri);

  return {
    ipfsUri,
    txHash: camino.txHash,
    contentId: camino.contentId
  };
}