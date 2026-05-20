import { useMemo, useState } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const BTR_CONTENT_REGISTRY = "0x17B8b74E1D0C50878ab8Bf5642b4E3E8702D178a";

const ABI_CONTENT = [
  "function createContent(string uri) external",
  "function getContent(uint256 id) external view returns (tuple(uint256 id, address author, string uri, bool active))",
  "event ContentCreated(uint256 indexed id, address indexed author, string uri)"
];

type BookingProof = {
  type: "LOOVE_ITALY_CAMINO_BOOKING_PROOF";
  version: "1.0";
  createdAt: string;
  hotelName: string;
  roomName: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  price: string;
  currency: string;
  guestName: string;
  guestEmail: string;
  status: "SIMULATED_CONFIRMED";
  source: "Loove Italy";
};

export default function HotelPage() {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const [loading, setLoading] = useState(false);
  const [ipfsUri, setIpfsUri] = useState("");
  const [txHash, setTxHash] = useState("");
  const [contentId, setContentId] = useState("");
  const [error, setError] = useState("");

  const hotel = useMemo(
    () => ({
      name: "Palazzo Loove Roma",
      destination: "Roma, Italia",
      roomName: "Camera 206 — Vista Colosseo Garantita",
      price: "420",
      currency: "EUR",
      description:
        "Un soggiorno iconico nel cuore di Roma, con camera specifica garantita e vista premium certificata nel percorso Loove Italy."
    }),
    []
  );

  async function publishToIPFS(payload: BookingProof): Promise<string> {
    const response = await fetch("/api/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Errore durante la pubblicazione su IPFS");
    }

    const data = await response.json();

    const uri =
      data.uri ||
      data.ipfsUri ||
      data.url ||
      (data.IpfsHash ? `ipfs://${data.IpfsHash}` : "");

    if (!uri) {
      throw new Error("IPFS pubblicato, ma URI non trovato nella risposta");
    }

    return uri;
  }

  async function registerOnCamino(uri: string) {
    if (!window.ethereum) {
      throw new Error("MetaMask non trovato");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      BTR_CONTENT_REGISTRY,
      ABI_CONTENT,
      signer
    );

    const tx = await contract.createContent(uri);
    const receipt = await tx.wait();

    let createdId = "";

    for (const log of receipt?.logs || []) {
      try {
        const parsed = contract.interface.parseLog({
  topics: log.topics,
  data: log.data
});
        if (parsed?.name === "ContentCreated") {
          createdId = parsed.args.id.toString();
        }
      } catch {
        // ignore unrelated logs
      }
    }

    return {
      hash: tx.hash,
      id: createdId
    };
  }

  async function handleBookingProof() {
    setError("");
    setIpfsUri("");
    setTxHash("");
    setContentId("");

    if (!guestName || !guestEmail || !checkIn || !checkOut) {
      setError("Compila nome, email, check-in e check-out.");
      return;
    }

    setLoading(true);

    try {
      const proof: BookingProof = {
        type: "LOOVE_ITALY_CAMINO_BOOKING_PROOF",
        version: "1.0",
        createdAt: new Date().toISOString(),
        hotelName: hotel.name,
        roomName: hotel.roomName,
        destination: hotel.destination,
        checkIn,
        checkOut,
        guests,
        price: hotel.price,
        currency: hotel.currency,
        guestName,
        guestEmail,
        status: "SIMULATED_CONFIRMED",
        source: "Loove Italy"
      };

      const uri = await publishToIPFS(proof);
      setIpfsUri(uri);

      const caminoResult = await registerOnCamino(uri);
      setTxHash(caminoResult.hash);
      setContentId(caminoResult.id);
    } catch (err) {
  const message =
    err instanceof Error
      ? err.message
      : "Errore durante la creazione della booking proof";

  setError(message);
}
      finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#15110d]">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="h-72 bg-gradient-to-br from-[#d8c3a5] via-[#efe4d2] to-[#b78b5d]" />

            <div className="p-8">
              <p className="text-sm uppercase tracking-[0.25em] text-[#9b6b43]">
                Loove Italy Selection
              </p>

              <h1 className="mt-3 text-4xl font-semibold">{hotel.name}</h1>

              <p className="mt-2 text-lg text-[#6f665f]">
                {hotel.destination}
              </p>

              <p className="mt-6 max-w-2xl text-base leading-7 text-[#514943]">
                {hotel.description}
              </p>

              <div className="mt-8 rounded-2xl border border-[#eadfce] bg-[#fffaf3] p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-[#9b6b43]">
                  Camera selezionata
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  {hotel.roomName}
                </h2>

                <p className="mt-3 text-[#6f665f]">
                  Prenotazione con camera specifica garantita e prova Camino
                  generata automaticamente dopo la pubblicazione IPFS.
                </p>

                <div className="mt-5 text-3xl font-semibold">
                  € {hotel.price}
                  <span className="text-base font-normal text-[#6f665f]">
                    {" "}
                    / notte
                  </span>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Booking Proof</h2>

            <p className="mt-2 text-sm leading-6 text-[#6f665f]">
              Questo flusso simula una prenotazione Loove Italy: prima crea il
              JSON della prenotazione, poi lo salva su IPFS, infine registra
              automaticamente l’URI su Camino.
            </p>

            <div className="mt-6 space-y-4">
              <input
                className="w-full rounded-xl border border-[#e5ded3] px-4 py-3 outline-none"
                placeholder="Nome cliente"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />

              <input
                className="w-full rounded-xl border border-[#e5ded3] px-4 py-3 outline-none"
                placeholder="Email cliente"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full rounded-xl border border-[#e5ded3] px-4 py-3 outline-none"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />

                <input
                  className="w-full rounded-xl border border-[#e5ded3] px-4 py-3 outline-none"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              <input
                className="w-full rounded-xl border border-[#e5ded3] px-4 py-3 outline-none"
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              />

              <button
                onClick={handleBookingProof}
                disabled={loading}
                className="w-full rounded-xl bg-[#15110d] px-5 py-4 font-medium text-white disabled:opacity-60"
              >
                {loading
                  ? "Creazione booking proof..."
                  : "Conferma e registra su Camino"}
              </button>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {(ipfsUri || txHash || contentId) && (
              <div className="mt-6 rounded-2xl border border-[#eadfce] bg-[#fffaf3] p-5 text-sm">
                <h3 className="font-semibold">Booking proof creata</h3>

                {contentId && (
                  <p className="mt-3 break-all">
                    <strong>Camino Content ID:</strong> {contentId}
                  </p>
                )}

                {ipfsUri && (
                  <p className="mt-3 break-all">
                    <strong>IPFS URI:</strong> {ipfsUri}
                  </p>
                )}

                {txHash && (
                  <p className="mt-3 break-all">
                    <strong>Transaction Hash:</strong> {txHash}
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}