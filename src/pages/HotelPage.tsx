import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

const rooms = [
  {
    name: "Deluxe Vista Mare",
    tag: "Più scelta",
    size: "28 m²",
    guests: "2 ospiti",
    description: "Vista panoramica sul Mediterraneo",
    price: "€ 420",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Junior Suite",
    tag: "",
    size: "35 m²",
    guests: "2 ospiti",
    description: "Ampio balcone & area relax",
    price: "€ 560",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Suite Prestige",
    tag: "",
    size: "50 m²",
    guests: "2 ospiti",
    description: "Terrazza privata con jacuzzi",
    price: "€ 890",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Miramare Suite",
    tag: "",
    size: "80 m²",
    guests: "2-4 ospiti",
    description: "Piscina privata & vista mare",
    price: "€ 1.450",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
  },
]

const gallery = [
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=900&auto=format&fit=crop",
]

type BookingStep = "form" | "wallet" | "success"

function parseEuroPrice(value: string) {
  return Number(value.replace("€", "").replace(".", "").trim())
}

function getNights(checkIn: string, checkOut: string) {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diff = end.getTime() - start.getTime()
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return nights > 0 ? nights : 1
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function shortWallet(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function HotelPage() {
  const navigate = useNavigate()
  const [selectedRoom, setSelectedRoom] = useState(rooms[0])
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingStep, setBookingStep] = useState<BookingStep>("form")
  const [customerName, setCustomerName] = useState("")
  const [customerDetails, setCustomerDetails] = useState("")
  const [checkIn, setCheckIn] = useState("2025-06-10")
  const [checkOut, setCheckOut] = useState("2025-06-14")
  const [walletAddress, setWalletAddress] = useState("")
  const [walletError, setWalletError] = useState("")

  const nights = useMemo(() => getNights(checkIn, checkOut), [checkIn, checkOut])
  const nightlyPrice = useMemo(() => parseEuroPrice(selectedRoom.price), [selectedRoom])
  const totalNumber = nightlyPrice * nights
  const total = formatEuro(totalNumber)

  const publicBookingCode = useMemo(() => `LOOVE-${Math.floor(10000 + Math.random() * 90000)}`, [bookingStep])
  const technicalBookingId = useMemo(() => {
    const seed = Math.floor(100000000 + Math.random() * 900000000)
    return `HLB-${seed}`
  }, [bookingStep])

  function openBooking() {
    setBookingOpen(true)
    setBookingStep("form")
    setWalletError("")
  }

  function closeBooking() {
    setBookingOpen(false)
    setBookingStep("form")
    setWalletError("")
  }

  async function connectWalletAndConfirm() {
    setWalletError("")
    const ethereum = (window as any).ethereum

    if (!ethereum) {
      setWalletError("MetaMask non rilevato. Installa o attiva MetaMask per completare la prenotazione.")
      return
    }

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" })
      const firstAccount = accounts?.[0]

      if (!firstAccount) {
        setWalletError("Connessione wallet non completata.")
        return
      }

      setWalletAddress(firstAccount)
      setBookingStep("success")
    } catch {
      setWalletError("Connessione MetaMask annullata o non riuscita.")
    }
  }

  return (
    <div className="min-h-screen bg-[#fff8f7] text-[#111027]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/88 px-5 py-4 backdrop-blur-2xl md:px-10">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
            <img src="/looveitaly.png" alt="Loove Italy" className="h-12 w-auto" />
          </button>

          <nav className="hidden items-center gap-10 text-sm font-bold lg:flex">
            {["Soggiorni", "Volo", "Hotel", "Eventi", "Taxi e NCC", "Tour", "TripMixer AI"].map((item) => (
              <span key={item} className={item === "Hotel" ? "text-rose-500" : "text-neutral-950"}>
                {item}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden rounded-full border border-rose-200 px-5 py-3 text-sm font-black text-rose-500 md:block">
              ♡
            </button>
            <button className="rounded-full bg-rose-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(244,63,94,0.28)]">
              Area Loover
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="relative h-[530px] bg-cover bg-center md:h-[590px]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2400&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/76 via-black/34 to-black/16" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

          <div className="relative z-10 mx-auto flex h-full max-w-[1500px] flex-col justify-end px-5 pb-10 md:px-10">
            <p className="mb-8 text-xs font-semibold text-white/75">
              Home › Hotel › Costiera Amalfitana › Positano › Hotel Miramare Positano
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/18 px-4 py-2 text-xs font-black text-white backdrop-blur-xl">
                ● Loove Verified
              </span>
              <span className="rounded-full bg-white/14 px-4 py-2 text-xs font-semibold text-white/82 backdrop-blur-xl">
                Struttura verificata
              </span>
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.06em] text-white md:text-7xl">
              Hotel Miramare
              <br />
              Positano
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm font-bold text-white">
              <span className="text-rose-500">★★★★★</span>
              <span>4,9 · 328 recensioni Loover</span>
              <span>📍 Via Trara Genoino, 27, Positano SA, Italia</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-white/92">
              {["Vista Mare", "Piscina Infinity", "Spa & Wellness", "Parcheggio", "Wi‑Fi Gratuito"].map((x) => (
                <span key={x} className="rounded-full bg-black/24 px-3 py-2 backdrop-blur-xl">
                  {x}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
              <div className="flex gap-4">
                <button
                  onClick={openBooking}
                  className="rounded-2xl bg-rose-500 px-8 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(244,63,94,0.35)] transition hover:-translate-y-0.5 hover:bg-rose-600"
                >
                  Prenota
                </button>
                <button className="rounded-2xl border border-white/35 bg-white/10 px-8 py-4 text-sm font-black text-white backdrop-blur-xl">
                  ♡ Salva nei preferiti
                </button>
              </div>

              <div className="hidden gap-3 lg:flex">
                {gallery.map((img) => (
                  <div
                    key={img}
                    className="h-24 w-24 rounded-2xl border-2 border-white bg-cover bg-center shadow-xl"
                    style={{ backgroundImage: `url('${img}')` }}
                  />
                ))}
                <div className="grid h-24 w-24 place-items-center rounded-2xl bg-white text-center text-sm font-black text-neutral-950 shadow-xl">
                  +24
                  <br />
                  Foto
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-[1500px] gap-8 px-5 py-9 md:px-10 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0">
          <section className="mb-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-[-0.04em]">Scegli la tua camera</h2>
                <p className="mt-1 text-sm text-neutral-500">11 tipologie disponibili</p>
              </div>
              <button className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-black shadow-sm">
                ☷ Filtra camere
              </button>
            </div>

            <div className="space-y-5">
              {rooms.map((room) => {
                const active = selectedRoom.name === room.name
                return (
                  <button
                    key={room.name}
                    onClick={() => setSelectedRoom(room)}
                    className={`group grid w-full overflow-hidden rounded-[28px] border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:grid-cols-[340px_1fr] ${
                      active ? "border-rose-400 ring-4 ring-rose-100" : "border-black/5"
                    }`}
                  >
                    <div
                      className="relative h-64 bg-cover bg-center md:h-full"
                      style={{ backgroundImage: `url('${room.image}')` }}
                    >
                      {room.tag && (
                        <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-4 py-2 text-xs font-black text-white">
                          {room.tag}
                        </span>
                      )}
                    </div>

                    <div className="flex min-h-[220px] flex-col justify-between p-6">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-xl font-black">{room.name}</h3>
                          <span className="text-2xl text-neutral-400">♡</span>
                        </div>
                        <p className="mt-2 text-sm text-neutral-500">
                          {room.size} · {room.guests}
                        </p>
                        <p className="mt-4 text-base text-neutral-700">{room.description}</p>
                        <div className="mt-5 flex gap-3 text-neutral-500">
                          <span>👥</span>
                          <span>🛏️</span>
                          <span>📶</span>
                          <span>🧳</span>
                        </div>
                      </div>

                      <div className="mt-6 flex items-end justify-between">
                        <p className="text-sm text-neutral-500">
                          da <span className="text-2xl font-black text-neutral-950">{room.price}</span> / notte
                        </p>
                        <span className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-black text-white">
                          Seleziona
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <button className="mt-5 w-full rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-black text-rose-500">
              Vedi tutte le 11 camere ↓
            </button>
          </section>

          <section className="mb-8 rounded-[32px] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Un’esperienza indimenticabile</h2>
            <p className="mt-2 max-w-3xl leading-7 text-neutral-600">
              Affacciato sulla splendida Costiera Amalfitana, l’Hotel Miramare Positano unisce eleganza mediterranea,
              comfort esclusivo e servizi impeccabili.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {[
                ["🌸", "Servizio 5 stelle", "Staff sempre disponibile"],
                ["🍽️", "Cucina gourmet", "Ristorante vista mare"],
                ["🧖", "Spa & Wellness", "Massaggi e trattamenti"],
                ["🌿", "Sostenibilità", "Struttura eco-friendly"],
              ].map(([icon, title, text]) => (
                <div key={title} className="rounded-2xl border border-black/5 bg-[#fff8f7] p-4">
                  <div className="mb-2 text-2xl">{icon}</div>
                  <h3 className="font-black">{title}</h3>
                  <p className="text-xs text-neutral-500">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-[-0.04em]">Cosa dicono i Loover</h2>
              <p className="font-black text-rose-500">★ 4,9/5</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {["Giulia R.", "Marco T.", "Elena V."].map((name, index) => (
                <div key={name} className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-100 font-black text-rose-500">
                      {name[0]}
                    </div>
                    <div>
                      <p className="font-black">{name}</p>
                      {index === 0 && <p className="text-xs font-bold text-emerald-600">Loover Verified</p>}
                    </div>
                  </div>
                  <p className="mb-3 text-rose-500">★★★★★</p>
                  <p className="text-sm leading-6 text-neutral-600">
                    Struttura da sogno, vista mozzafiato e servizio impeccabile. Un’esperienza che rimarrà nel cuore!
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[34px] border border-black/5 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-4xl font-black tracking-[-0.05em]">
                  {selectedRoom.price} <span className="text-base font-bold tracking-normal">/notte</span>
                </p>
                <p className="mt-2 font-black">{selectedRoom.name}</p>
              </div>
              <span className="rounded-2xl bg-emerald-100 px-4 py-3 text-center text-xs font-black text-emerald-700">
                Miglior prezzo
                <br />
                Loove Italy
              </span>
            </div>

            <div className="border-t border-neutral-100 pt-5">
              <p className="mb-3 font-black">Date</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="rounded-2xl border border-neutral-200 p-4">
                  <p className="text-xs text-neutral-500">Check-in</p>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(event) => setCheckIn(event.target.value)}
                    className="mt-1 w-full bg-transparent text-sm font-black outline-none"
                  />
                </label>
                <label className="rounded-2xl border border-neutral-200 p-4">
                  <p className="text-xs text-neutral-500">Check-out</p>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(event) => setCheckOut(event.target.value)}
                    className="mt-1 w-full bg-transparent text-sm font-black outline-none"
                  />
                </label>
              </div>
              <p className="mt-3 text-center text-sm font-black">{nights} notti · Totale {total}</p>
            </div>

            <div className="mt-6">
              <p className="mb-3 font-black">Ospiti</p>
              <div className="rounded-2xl border border-neutral-200 p-4 font-black">2 Adulti ˅</div>
            </div>

            <div className="mt-6">
              <p className="mb-3 font-black">I tuoi dati</p>
              <label className="mb-2 block text-xs font-bold text-neutral-500">Nome</label>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="mb-4 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                placeholder="Inserisci il tuo nome"
              />
              <label className="mb-2 block text-xs font-bold text-neutral-500">Dettagli</label>
              <input
                value={customerDetails}
                onChange={(event) => setCustomerDetails(event.target.value)}
                className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                placeholder="Email o telefono (per la conferma)"
              />
            </div>

            <button
              onClick={openBooking}
              className="mt-6 w-full rounded-2xl bg-rose-500 px-6 py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(244,63,94,0.32)] transition hover:-translate-y-0.5 hover:bg-rose-600"
            >
              Prenota
            </button>

            <div className="mt-5 space-y-2 text-sm text-neutral-600">
              <p>✅ Cancellazione gratuita fino a 48h prima</p>
              <p>✅ Pagamento sicuro</p>
            </div>
          </div>

          <div className="mt-6 rounded-[30px] border border-rose-100 bg-rose-50 p-6">
            <h3 className="mb-5 font-black">Perché prenotare con Loove Italy</h3>
            <div className="space-y-4 text-sm text-neutral-700">
              <p>🏷️ Miglior prezzo garantito</p>
              <p>🎧 Assistenza Loover 24/7</p>
              <p>💳 Paga in 3 rate senza interessi</p>
              <p>🛡️ Loove Verified – Struttura controllata</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[30px] bg-white shadow-sm">
            <div
              className="h-44 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=900&auto=format&fit=crop')",
              }}
            />
            <div className="p-5">
              <h3 className="font-black">Posizione</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Nel cuore di Positano, a pochi passi dalla spiaggia e dalle boutique più esclusive.
              </p>
              <button className="mt-4 text-sm font-black text-rose-500">Vedi sulla mappa →</button>
            </div>
          </div>
        </aside>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/92 p-4 shadow-[0_-20px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-black">{selectedRoom.name}</p>
            <p className="text-sm text-neutral-500">
              {checkIn} - {checkOut} · 2 Adulti
            </p>
          </div>
          <button onClick={openBooking} className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white">
            {total}
          </button>
        </div>
      </div>

      {bookingOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-neutral-950/62 px-4 py-8 backdrop-blur-md">
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[34px] bg-white shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
            <button
              onClick={closeBooking}
              className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl font-black text-neutral-500 shadow-lg"
            >
              ×
            </button>

            {bookingStep === "form" && (
              <div className="p-6 md:p-8">
                <div className="mb-6 overflow-hidden rounded-[28px] bg-[#fff8f7]">
                  <div
                    className="h-56 bg-cover bg-center"
                    style={{ backgroundImage: `url('${selectedRoom.image}')` }}
                  />
                  <div className="p-6">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-rose-500">
                      Loove Italy booking
                    </p>
                    <h2 className="text-3xl font-black tracking-[-0.05em]">Conferma la tua prenotazione</h2>
                    <p className="mt-2 text-neutral-600">
                      Verifica camera, date e dati cliente prima di procedere con la conferma.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold text-neutral-400">Hotel</p>
                    <p className="mt-1 font-black">Hotel Miramare Positano</p>
                  </div>
                  <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold text-neutral-400">Camera</p>
                    <p className="mt-1 font-black">{selectedRoom.name}</p>
                  </div>
                  <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold text-neutral-400">Date</p>
                    <p className="mt-1 font-black">
                      {checkIn} - {checkOut} · {nights} notti
                    </p>
                  </div>
                  <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold text-neutral-400">Totale</p>
                    <p className="mt-1 text-2xl font-black">{total}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] bg-[#fff8f7] p-5">
                  <h3 className="mb-4 font-black">Dati cliente</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-neutral-500">Nome e cognome</label>
                      <input
                        value={customerName}
                        onChange={(event) => setCustomerName(event.target.value)}
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        placeholder="Es. Stefano Amati"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold text-neutral-500">Email o telefono</label>
                      <input
                        value={customerDetails}
                        onChange={(event) => setCustomerDetails(event.target.value)}
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        placeholder="Per ricevere la conferma"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-rose-100 bg-rose-50 p-5">
                  <h3 className="mb-3 font-black">Conferma tramite wallet</h3>
                  <p className="text-sm leading-6 text-neutral-700">
                    In questa fase il wallet serve a creare un ID tecnico verificabile della prenotazione. L’ID rimane
                    nascosto lato cliente e sarà visibile solo negli ambienti professionali autorizzati.
                  </p>
                </div>

                <button
                  onClick={() => setBookingStep("wallet")}
                  className="mt-6 w-full rounded-2xl bg-rose-500 px-6 py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(244,63,94,0.32)] transition hover:-translate-y-0.5 hover:bg-rose-600"
                >
                  Procedi alla conferma
                </button>
              </div>
            )}

            {bookingStep === "wallet" && (
              <div className="grid min-h-[560px] place-items-center p-8 text-center">
                <div className="w-full max-w-md">
                  <div className="mx-auto mb-7 grid h-24 w-24 place-items-center rounded-full bg-rose-100 text-4xl">
                    🦊
                  </div>
                  <h2 className="text-3xl font-black tracking-[-0.05em]">Connetti MetaMask</h2>
                  <p className="mx-auto mt-3 leading-7 text-neutral-600">
                    Conferma il wallet per creare il codice tecnico della prenotazione. Al cliente verrà mostrato solo
                    il codice Loove.
                  </p>

                  {walletError && (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
                      {walletError}
                    </div>
                  )}

                  <button
                    onClick={connectWalletAndConfirm}
                    className="mt-7 w-full rounded-2xl bg-rose-500 px-6 py-4 text-sm font-black text-white shadow-[0_18px_42px_rgba(244,63,94,0.32)] transition hover:-translate-y-0.5 hover:bg-rose-600"
                  >
                    Connetti MetaMask e conferma
                  </button>

                  <button
                    onClick={() => setBookingStep("form")}
                    className="mt-3 w-full rounded-2xl border border-neutral-200 bg-white px-6 py-4 text-sm font-black text-neutral-700"
                  >
                    Torna al riepilogo
                  </button>
                </div>
              </div>
            )}

            {bookingStep === "success" && (
              <div className="p-6 md:p-8">
                <div className="rounded-[30px] bg-gradient-to-br from-rose-500 to-fuchsia-500 p-8 text-white">
                  <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-white/18 text-3xl backdrop-blur-xl">
                    ✓
                  </div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-white/75">
                    Booking confirmed
                  </p>
                  <h2 className="text-4xl font-black tracking-[-0.06em]">Prenotazione confermata</h2>
                  <p className="mt-3 max-w-xl leading-7 text-white/86">
                    La prenotazione è stata creata. Il codice tecnico rimane nascosto lato cliente e potrà essere usato
                    in futuro per verifica HolHub/Holid.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-[1fr_260px]">
                  <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
                    <h3 className="mb-5 font-black">Riepilogo prenotazione</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between gap-4 border-b border-neutral-100 pb-3">
                        <span className="text-neutral-500">Codice cliente</span>
                        <span className="font-black">{publicBookingCode}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-neutral-100 pb-3">
                        <span className="text-neutral-500">Cliente</span>
                        <span className="font-black">{customerName || "Cliente demo"}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-neutral-100 pb-3">
                        <span className="text-neutral-500">Hotel</span>
                        <span className="font-black">Miramare Positano</span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-neutral-100 pb-3">
                        <span className="text-neutral-500">Camera</span>
                        <span className="font-black">{selectedRoom.name}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-neutral-100 pb-3">
                        <span className="text-neutral-500">Wallet</span>
                        <span className="font-black">{shortWallet(walletAddress)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-neutral-500">Totale</span>
                        <span className="text-xl font-black">{total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-rose-100 bg-rose-50 p-6">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">ID tecnico</p>
                    <div className="mt-5 rounded-[24px] bg-white p-5 text-center shadow-sm">
                      <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-4xl text-white">
                        ◈
                      </div>
                      <p className="font-black">{technicalBookingId}</p>
                      <p className="mt-2 text-xs leading-5 text-neutral-500">
                        ID nascosto lato cliente, leggibile solo da ambienti autorizzati HolHub/Holid.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] bg-[#fff8f7] p-6">
                  <h3 className="mb-4 font-black">Futura integrazione professionale</h3>
                  <div className="grid gap-3 text-sm text-neutral-700 md:grid-cols-3">
                    <p className="rounded-2xl bg-white p-4 shadow-sm">🏨 Verifica hotel</p>
                    <p className="rounded-2xl bg-white p-4 shadow-sm">🔐 ID prenotazione nascosto</p>
                    <p className="rounded-2xl bg-white p-4 shadow-sm">🧾 Accounting sync</p>
                    <p className="rounded-2xl bg-white p-4 shadow-sm">🌐 HolHub provider view</p>
                    <p className="rounded-2xl bg-white p-4 shadow-sm">🆔 Holid registry</p>
                    <p className="rounded-2xl bg-white p-4 shadow-sm">⭐ Loover rewards</p>
                  </div>
                </div>

                <button
                  onClick={closeBooking}
                  className="mt-6 w-full rounded-2xl bg-neutral-950 px-6 py-4 text-sm font-black text-white transition hover:-translate-y-0.5"
                >
                  Chiudi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
