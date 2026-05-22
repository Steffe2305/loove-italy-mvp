import { useEffect, useMemo, useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"

import { loadLooveHotels, type LooveHotel } from "./lib/looveData"
import HotelPage from "./pages/HotelPage"

const serviceTabs = [
  "Soggiorni",
  "Volo",
  "Hotel",
  "Eventi",
  "Taxi e NCC",
  "Tour",
  "TripMixer AI",
]

const heroImages = [
  "https://images.unsplash.com/photo-1529154036614-a60975f5c760?q=80&w=2200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2200&auto=format&fit=crop",
]

function LooveLogo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/looveitaly.png"
        alt="Loove Italy"
        className="h-14 w-auto drop-shadow-[0_18px_28px_rgba(0,0,0,0.22)]"
      />
    </div>
  )
}

function TrustPill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-bold text-white/90 backdrop-blur-xl">
      <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_5px_rgba(110,231,183,0.18)]" />
      {children}
    </span>
  )
}

function HomePage() {
  const [destination, setDestination] = useState("")
  const [submittedDestination, setSubmittedDestination] = useState("")
  const [selectedService, setSelectedService] = useState("Soggiorni")
  const [hasSearched, setHasSearched] = useState(false)
  const [hotels, setHotels] = useState<LooveHotel[]>([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    loadLooveHotels()
      .then((data) => setHotels(data))
      .catch((err) => console.error("Error loading Loove hotels", err))
      .finally(() => setLoading(false))
  }, [])

  const isStaySearch = selectedService === "Soggiorni" || selectedService === "Hotel"

  const search = submittedDestination.toLowerCase().trim()

  const results = hotels.filter((hotel) => {
    if (!search) return true

    return (
      hotel.destination.toLowerCase().includes(search) ||
      hotel.region.toLowerCase().includes(search) ||
      hotel.name.toLowerCase().includes(search)
    )
  })

    function handleSearch() {
    setSubmittedDestination(destination)
    setHasSearched(true)
  }

  return (
    <div className="min-h-screen bg-[#fff8f7] text-neutral-950">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url('${heroImages[0]}')` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/28 to-[#fff8f7]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(244,63,94,0.45),transparent_35%),radial-gradient(circle_at_86%_32%,rgba(217,70,239,0.30),transparent_36%)]" />
        </div>

        <header className="relative z-20 px-5 pt-5 md:px-8 md:pt-7">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between rounded-full border border-white/20 bg-white/12 px-5 py-3 text-white shadow-2xl shadow-black/10 backdrop-blur-2xl">
            <LooveLogo />

            <nav className="hidden gap-8 text-sm font-semibold text-white/85 lg:flex">
              <a href="#tripmixer" className="transition hover:text-white">TripMixer</a>
              <a href="#soggiorni" className="transition hover:text-white">Soggiorni</a>
              <a href="#loovepack" className="transition hover:text-white">LoovePack</a>
              <a href="#loovers" className="transition hover:text-white">Loovers</a>
              <a href="#trust" className="transition hover:text-white">Operatori verificati</a>
            </nav>

            <button className="hidden rounded-full bg-white px-5 py-2.5 text-sm font-black text-neutral-950 shadow-lg transition hover:-translate-y-0.5 md:block">
              Accedi
            </button>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] max-w-[1480px] flex-col justify-center px-5 pb-20 pt-16 md:px-8">
          <div className="max-w-5xl text-white">
            <div className="mb-6 flex flex-wrap gap-3">
              <TrustPill>Operatori verificati Holid</TrustPill>
              <TrustPill>Esperienze prenotabili</TrustPill>
              <TrustPill>Powered by Hologys ecosystem</TrustPill>
            </div>

            <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-rose-100/90">
              Loove Italy · TripMixer AI
            </p>

            <h1 className="max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.07em] md:text-7xl xl:text-8xl">
              Viaggiare in Italia non è mai stato così facile.
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/82 md:text-xl">
              Trova il pacchetto giusto per il tuo stile e le tue passioni ai prezzi convenienti di un solo portale. Tutto il mondo che vuoi scoprire!
            </p>
          </div>

          <div className="relative z-20 mx-auto mt-12 w-full max-w-6xl rounded-[34px] border border-white/30 bg-white/92 p-4 shadow-[0_28px_80px_-38px_rgba(0,0,0,0.65)] backdrop-blur-2xl md:p-5">
            <div className="mb-5 flex flex-wrap justify-center gap-2 md:gap-3">
              {serviceTabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelectedService(item)}
                  className={`rounded-full px-4 py-2.5 text-sm font-black transition ${
                    selectedService === item
                      ? "bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white shadow-lg shadow-rose-500/25"
                      : "bg-rose-50 text-neutral-700 hover:bg-rose-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className={`grid gap-3 ${isStaySearch ? "lg:grid-cols-6" : "lg:grid-cols-5"}`}>
              <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 shadow-sm lg:col-span-2">
                <label className="mb-1 block text-xs font-black uppercase tracking-[0.18em] text-rose-500">Destinazione</label>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-transparent text-base font-semibold text-neutral-950 outline-none placeholder:text-neutral-400"
                  placeholder={selectedService === "TripMixer AI" ? "Weekend romantico in Toscana..." : "Roma, Toscana, Ferrara..."}
                />
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                <label className="mb-1 block text-xs font-black uppercase tracking-[0.18em] text-rose-500">Arrivo</label>
                <input type="date" className="w-full bg-transparent text-base font-semibold text-neutral-950 outline-none" />
              </div>

              {isStaySearch && (
                <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                  <label className="mb-1 block text-xs font-black uppercase tracking-[0.18em] text-rose-500">Partenza</label>
                  <input type="date" className="w-full bg-transparent text-base font-semibold text-neutral-950 outline-none" />
                </div>
              )}

              <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                <label className="mb-1 block text-xs font-black uppercase tracking-[0.18em] text-rose-500">Viaggiatori</label>
                <select className="w-full bg-transparent text-base font-semibold text-neutral-950 outline-none">
                  <option>2 adulti</option>
                  <option>1 adulto</option>
                  <option>Famiglia</option>
                  <option>Gruppo</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 px-6 py-5 text-base font-black text-white shadow-xl shadow-rose-500/25 transition hover:-translate-y-0.5 hover:shadow-2xl lg:col-span-1"
              >
                {selectedService === "TripMixer AI" ? "Crea viaggio" : "Cerca"}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2 text-sm text-neutral-500">
              <span>Modalità: <strong className="text-neutral-900">{selectedService}</strong></span>
              {loading ? <span>Caricamento servizi Loove...</span> : <span>{hotels.length} strutture compatibili caricate</span>}
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="mx-auto -mt-8 grid max-w-[1480px] gap-5 px-5 pb-20 md:grid-cols-4 md:px-8">
        {[
          ["Holid verified", "Operatori identificati e collegati al trust layer Hologys."],
          ["Holihub ready", "Profili e contenuti verificabili nel network professionale."],
          ["NFT-ready proof", "Prenotazioni predisposte a voucher e proof verificabili."],
          ["TripMixer AI", "Itinerari e pacchetti componibili in modo guidato."],
        ].map(([title, text]) => (
          <div key={title} className="rounded-[28px] border border-rose-100 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h3 className="text-lg font-black tracking-[-0.03em] text-neutral-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-500">{text}</p>
          </div>
        ))}
      </section>

      {hasSearched && (
        <section id="soggiorni" className="mx-auto max-w-[1480px] px-5 pb-24 md:px-8">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.32em] text-rose-500">
                Risultati {selectedService}
              </p>
              <h2 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.06em] text-neutral-950 md:text-6xl">
                {results.length > 0
                  ? `Proposte disponibili per “${submittedDestination || "Italia"}”`
                  : "Nessuna proposta trovata"}
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-neutral-500">
              Ogni struttura mostrata su Loove deve essere collegata a un operatore verificato e diventare realmente prenotabile, non una semplice figurina.
            </p>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {results.map((hotel) => (
                <article key={hotel.id} className="group overflow-hidden rounded-[34px] border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl">
                  <div className="relative h-80 overflow-hidden">
                    <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute left-5 top-5 rounded-full bg-white/92 px-4 py-2 text-xs font-black text-rose-500 backdrop-blur-xl">
                      LOOVE VERIFIED
                    </div>
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <p className="text-sm font-bold text-white/75">{hotel.type} · {hotel.destination}</p>
                      <h3 className="mt-1 text-3xl font-black tracking-[-0.05em]">{hotel.name}</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-neutral-500">{hotel.region}</p>
                        <p className="mt-1 text-sm text-neutral-500">Operatore verificato · NFT-ready proof</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">da</p>
                        <p className="text-3xl font-black text-neutral-950">€{hotel.startingPrice}</p>
                        <p className="text-xs text-neutral-500">/ notte</p>
                      </div>
                    </div>

                    <p className="mb-6 line-clamp-3 leading-7 text-neutral-600">{hotel.description}</p>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {['Colazione', 'Camera verificata', 'Cancellazione flessibile'].map((tag) => (
                        <span key={tag} className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">{tag}</span>
                      ))}
                    </div>

                    <button onClick={() => navigate(`/hotel/${hotel.id}`)} className="w-full rounded-2xl bg-neutral-950 px-5 py-4 text-sm font-black text-white transition hover:bg-rose-500">
                      Vedi scheda premium
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-lg text-neutral-600">Prova a cercare Ferrara, Toscana o Roma.</p>
          )}
        </section>
      )}

      <section id="tripmixer" className="bg-neutral-950 px-5 py-24 text-white md:px-8">
        <div className="mx-auto grid max-w-[1480px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.32em] text-rose-300">TripMixer AI</p>
            <h2 className="text-4xl font-black leading-[0.98] tracking-[-0.06em] md:text-6xl">Dal soggiorno al viaggio completo, in pochi passaggi.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">Loove non mostra solo camere: orchestra servizi verificati, esperienze, transfer e pacchetti replicabili.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {['Scegli stile', 'Aggiungi servizi', 'Prenota con proof'].map((item, index) => (
              <div key={item} className="rounded-[30px] border border-white/10 bg-white/8 p-6 backdrop-blur-xl">
                <div className="mb-8 text-5xl font-black text-rose-300/80">0{index + 1}</div>
                <h3 className="text-xl font-black">{item}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">Un flusso semplice, emozionale e collegato al trust layer Hologys.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="loovers" className="bg-[#fff8f7] px-5 py-24 md:px-8">
        <div className="mx-auto max-w-[1480px]">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.32em] text-rose-500">Loover Community</p>
          <h2 className="mb-12 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.06em] md:text-6xl">
            Viaggi reali, raccontati e resi prenotabili.
          </h2>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              ["Roma", "https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1200&auto=format&fit=crop"],
              ["Dolomiti", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"],
              ["Sicilia", "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200&auto=format&fit=crop"],
              ["Costiera", "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop"],
            ].map(([place, image]) => (
              <div key={place} className="group relative h-[430px] overflow-hidden rounded-[34px] bg-cover bg-center shadow-sm" style={{ backgroundImage: `url('${image}')` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute left-5 top-5 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-black text-white">VERIFIED LOOVER</div>
                <div className="absolute bottom-0 p-6 text-white">
                  <p className="mb-2 text-sm font-semibold text-white/70">Travel Story</p>
                  <h3 className="mb-2 text-3xl font-black tracking-[-0.05em]">{place}</h3>
                  <p className="text-sm leading-6 text-white/78">Mini itinerari, esperienze e consigli autentici trasformabili in LoovePack.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/hotel/:id" element={<HotelPage />} />
    </Routes>
  )
}
