import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { loadLooveHotels, type LooveHotel } from "../lib/looveData"
import {
  createDemoBookingProof,
  type LooveBookingProof,
} from "../lib/booking"
import {
  publishBookingToIpfs,
  type IpfsPublishResult,
} from "../lib/ipfsBooking"

type BookingStep = "select" | "summary" | "confirmed"

export default function HotelPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [hotel, setHotel] = useState<LooveHotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [bookingStep, setBookingStep] = useState<BookingStep>("select")
  const [bookingProof, setBookingProof] = useState<LooveBookingProof | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [ipfsResult, setIpfsResult] = useState<IpfsPublishResult | null>(null)
  const [ipfsError, setIpfsError] = useState("")

  useEffect(() => {
    loadLooveHotels()
      .then((hotels) => {
        const selectedHotel = hotels.find((item) => item.id === Number(id))
        setHotel(selectedHotel || null)
      })
      .catch((err) => console.error("Error loading hotel", err))
      .finally(() => setLoading(false))
  }, [id])

  const selectedRoom = useMemo(() => {
    if (!hotel) return null
    return (
      hotel.rooms.find((room) => room.roomId === selectedRoomId) ||
      hotel.rooms[0]
    )
  }, [hotel, selectedRoomId])

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1

    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )

    return diff > 0 ? diff : 1
  }, [checkIn, checkOut])

  const total = selectedRoom ? selectedRoom.price * nights : 0

  async function handleBookingClick() {
    if (bookingStep === "select") {
      setBookingStep("summary")
      return
    }

    if (bookingStep === "summary") {
      const proof = createDemoBookingProof({
        hotel: hotel!,
        room: selectedRoom!,
        checkIn,
        checkOut,
        nights,
        total,
      })

      setBookingProof(proof)
      setBookingStep("confirmed")
      setPublishing(true)
      setIpfsResult(null)
      setIpfsError("")

      try {
        const result = await publishBookingToIpfs(proof)
        setIpfsResult(result)
      } catch (error) {
        setIpfsError(
          error instanceof Error
            ? error.message
            : "Errore durante la pubblicazione IPFS"
        )
      } finally {
        setPublishing(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-neutral-500">Caricamento proposta Loove...</p>
      </div>
    )
  }

  if (!hotel || !selectedRoom) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <h1 className="mb-4 text-4xl font-bold">Proposta non trovata</h1>
        <button
          onClick={() => navigate("/")}
          className="rounded-full bg-pink-500 px-6 py-3 font-bold text-white"
        >
          Torna alla home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <section
        className="relative h-[72vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${hotel.image})` }}
      >
        <div className="absolute inset-0 bg-black/45" />

        <header className="relative z-20 px-6 py-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/20 bg-white/15 px-5 py-3 text-white backdrop-blur-xl">
            <button onClick={() => navigate("/")} className="text-2xl font-bold">
              Loove Italy
            </button>

            <nav className="hidden gap-8 text-sm font-medium text-white/85 md:flex">
              <a href="#">TripMixer</a>
              <a href="#">Soggiorni</a>
              <a href="#">Esperienze</a>
              <a href="#">Loovers</a>
            </nav>

            <button className="hidden rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-900 md:block">
              Accedi
            </button>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex h-[calc(72vh-96px)] max-w-7xl items-end px-6 pb-16 text-white">
          <div>
            <div className="mb-4 w-fit rounded-full bg-pink-500 px-4 py-2 text-sm font-bold">
              LOOVE VERIFIED
            </div>

            <h1 className="mb-4 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
              {hotel.name}
            </h1>

            <p className="mb-3 text-lg font-semibold text-white/85">
              {hotel.type} · {hotel.destination}, {hotel.region}
            </p>

            <p className="max-w-3xl text-xl leading-8 text-white/85">
              {hotel.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1fr_420px]">
        <main>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-pink-500">
            Proposta Loove
          </p>

          <h2 className="mb-6 text-4xl font-bold">
            Soggiorno selezionato con TripMixer
          </h2>

          <p className="mb-10 text-lg leading-8 text-neutral-600">
            Questa proposta può essere combinata con esperienze, transfer e
            servizi locali per creare un viaggio completo in un unico flusso.
          </p>

          <h3 className="mb-6 text-2xl font-bold">Camere disponibili</h3>

          <div className="mb-14 space-y-5">
            {hotel.rooms.map((room) => {
              const isSelected = selectedRoom.roomId === room.roomId

              return (
                <div
                  key={room.roomId}
                  className={`rounded-[28px] border bg-white p-6 shadow-sm transition ${
                    isSelected ? "border-pink-500 shadow-lg" : "border-neutral-200"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                      <h4 className="mb-2 text-2xl font-bold">
                        {room.roomName}
                      </h4>

                      <p className="mb-3 leading-7 text-neutral-600">
                        {room.description}
                      </p>

                      <p className="text-sm font-semibold text-neutral-500">
                        Max {room.maxGuests} ospiti ·{" "}
                        {room.available ? "Disponibile" : "Non disponibile"}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-3xl font-bold">
                        €{room.price}
                        <span className="text-sm font-medium text-neutral-500">
                          {" "}
                          / notte
                        </span>
                      </p>

                      <button
                        onClick={() => {
                          setSelectedRoomId(room.roomId)
                          setBookingStep("select")
                          setBookingProof(null)
                          setIpfsResult(null)
                          setIpfsError("")
                        }}
                        className={`mt-4 rounded-full px-5 py-3 text-sm font-bold transition ${
                          isSelected
                            ? "bg-neutral-900 text-white"
                            : "bg-pink-500 text-white hover:bg-pink-600"
                        }`}
                      >
                        {isSelected ? "Camera selezionata" : "Seleziona camera"}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <h3 className="mb-6 text-2xl font-bold">
            Esperienze abbinate da TripMixer
          </h3>

          <div className="grid gap-5 md:grid-cols-2">
            {hotel.experiences.map((experience) => (
              <div
                key={experience.id}
                className="rounded-[28px] border border-neutral-200 bg-neutral-50 p-6"
              >
                <h4 className="mb-2 text-xl font-bold">{experience.title}</h4>
                <p className="mb-5 leading-7 text-neutral-600">
                  {experience.description}
                </p>
                <p className="font-bold text-pink-500">€{experience.price}</p>
              </div>
            ))}
          </div>
        </main>

        <aside className="h-fit rounded-[32px] border border-neutral-200 bg-white p-8 shadow-xl">
          {bookingStep !== "confirmed" ? (
            <>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-pink-500">
                Prenotazione
              </p>

              <h3 className="mb-3 text-3xl font-bold">{selectedRoom.roomName}</h3>

              <p className="mb-8 text-neutral-500">
                A partire da{" "}
                <span className="text-3xl font-bold text-neutral-900">
                  €{selectedRoom.price}
                </span>{" "}
                / notte
              </p>

              <div className="space-y-4">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => {
                    setCheckIn(e.target.value)
                    setBookingStep("select")
                    setBookingProof(null)
                    setIpfsResult(null)
                    setIpfsError("")
                  }}
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-4 outline-none focus:border-pink-500"
                />

                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => {
                    setCheckOut(e.target.value)
                    setBookingStep("select")
                    setBookingProof(null)
                    setIpfsResult(null)
                    setIpfsError("")
                  }}
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-4 outline-none focus:border-pink-500"
                />

                <div className="rounded-2xl bg-neutral-50 p-5">
                  <div className="mb-3 flex justify-between text-sm text-neutral-600">
                    <span>Notti</span>
                    <span>{nights}</span>
                  </div>

                  <div className="mb-3 flex justify-between text-sm text-neutral-600">
                    <span>Camera</span>
                    <span>€{selectedRoom.price} / notte</span>
                  </div>

                  <div className="flex justify-between border-t border-neutral-200 pt-4 text-xl font-bold">
                    <span>Totale demo</span>
                    <span>€{total}</span>
                  </div>
                </div>

                {bookingStep === "summary" && (
                  <div className="rounded-2xl border border-pink-200 bg-pink-50 p-5 text-sm leading-6 text-neutral-700">
                    <strong>Riepilogo pronto.</strong>
                    <br />
                    Il prossimo click confermerà la prenotazione demo e
                    pubblicherà automaticamente il booking proof su IPFS.
                  </div>
                )}

                <button
                  onClick={handleBookingClick}
                  className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-600 px-6 py-4 font-bold text-white"
                >
                  {bookingStep === "summary"
                    ? "CONFERMA PRENOTAZIONE"
                    : "PRENOTA ORA"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-pink-500 text-3xl text-white">
                ✓
              </div>

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-pink-500">
                Booking Proof Demo
              </p>

              <h3 className="mb-4 text-3xl font-bold">
                Prenotazione confermata
              </h3>

              {publishing && (
                <div className="mb-6 rounded-2xl border border-pink-200 bg-pink-50 p-5 text-sm font-semibold text-pink-700">
                  Pubblicazione automatica booking proof su IPFS in corso...
                </div>
              )}

              {ipfsResult && (
                <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-left text-sm leading-7 text-green-800">
                  <p className="font-bold">Booking proof pubblicato su IPFS</p>
                  <p className="break-all">
                    <strong>CID:</strong> {ipfsResult.cid}
                  </p>
                  <p className="break-all">
                    <strong>IPFS URI:</strong> {ipfsResult.ipfsUri}
                  </p>
                  <p className="break-all">
                    <strong>Gateway:</strong> {ipfsResult.gatewayUrl}
                  </p>
                </div>
              )}

              {ipfsError && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-left text-sm leading-7 text-red-700">
                  <strong>IPFS non pubblicato in locale.</strong>
                  <br />
                  {ipfsError}
                </div>
              )}

              <div className="mb-6 rounded-2xl bg-neutral-50 p-5 text-left text-sm leading-7 text-neutral-700">
                <p>
                  <strong>Booking ID:</strong>{" "}
                  {bookingProof?.bookingId || "LOOVE-DEMO"}
                </p>
                <p>
                  <strong>Check-in:</strong> {bookingProof?.stay.checkIn}
                </p>
                <p>
                  <strong>Check-out:</strong> {bookingProof?.stay.checkOut}
                </p>
                <p>
                  <strong>Notti:</strong> {bookingProof?.stay.nights}
                </p>
                <p>
                  <strong>Totale:</strong> €{bookingProof?.total.amount}
                </p>
              </div>

              <div className="rounded-2xl border border-pink-200 bg-pink-50 p-5 text-left text-sm leading-6 text-neutral-700">
                <strong>Ready for Camino proof.</strong>
                <br />
                Il booking JSON è pronto per essere registrato on-chain come
                prova di prenotazione.
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500">
                    Booking JSON Preview
                  </h4>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          JSON.stringify(bookingProof, null, 2)
                        )
                      }}
                      className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:bg-neutral-100"
                    >
                      Copia JSON
                    </button>

                    <button
                      onClick={() => {
                        const json = JSON.stringify(bookingProof, null, 2)
                        const blob = new Blob([json], {
                          type: "application/json",
                        })

                        const url = URL.createObjectURL(blob)
                        const link = document.createElement("a")
                        link.href = url
                        link.download = `${
                          bookingProof?.bookingId || "loove-booking"
                        }.json`
                        link.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-neutral-700"
                    >
                      Scarica JSON
                    </button>
                  </div>
                </div>

                <pre className="max-h-[320px] overflow-auto rounded-2xl bg-neutral-950 p-5 text-left text-xs leading-6 text-green-400">
                  {JSON.stringify(bookingProof, null, 2)}
                </pre>
              </div>

              <button
                onClick={() => navigate("/")}
                className="mt-6 rounded-full border border-pink-500 px-6 py-3 font-bold text-pink-500 transition hover:bg-pink-500 hover:text-white"
              >
                Torna alla home
              </button>
            </div>
          )}
        </aside>
      </section>
    </div>
  )
}