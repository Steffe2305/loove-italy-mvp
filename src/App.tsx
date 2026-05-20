import { useEffect, useState } from "react"
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

  const isStaySearch =
    selectedService === "Soggiorni" || selectedService === "Hotel"

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
    <div className="min-h-screen bg-white text-neutral-900">
      <section
        className="relative min-h-screen overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1529154036614-a60975f5c760?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black/45" />

        <header className="relative z-20 px-6 py-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/20 bg-white/15 px-5 py-3 text-white backdrop-blur-xl">
            <div className="text-2xl font-bold">Loove Italy</div>

            <nav className="hidden gap-8 text-sm font-medium text-white/85 md:flex">
              <a href="#">TripMixer</a>
              <a href="#">Soggiorni</a>
              <a href="#">Esperienze</a>
              <a href="#">Loovers</a>
              <a href="#">Come funziona</a>
            </nav>

            <button className="hidden rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-900 md:block">
              Accedi
            </button>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-96px)] max-w-7xl items-center justify-center px-6 text-center">
          <div className="max-w-5xl text-white">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
              Loove Italy • TripMixer AI
            </p>

            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
              Viaggiare in Italia non è
              <br />
              mai stato così facile.
            </h1>

            <p className="mx-auto mb-10 max-w-3xl text-lg leading-8 text-white/85 md:text-xl">
              Trova il pacchetto giusto per il tuo stile e le tue passioni ai
              prezzi convenienti di un solo portale. Tutto il mondo che vuoi
              scoprire!
            </p>

            <div className="mx-auto max-w-6xl rounded-[32px] border border-white/20 bg-white/15 p-5 shadow-2xl backdrop-blur-xl">
              <div className="mb-6 flex flex-wrap justify-center gap-3">
                {serviceTabs.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSelectedService(item)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                      selectedService === item
                        ? "bg-pink-500 text-white"
                        : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div
                className={`grid gap-4 ${
                  isStaySearch ? "md:grid-cols-5" : "md:grid-cols-4"
                }`}
              >
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="rounded-2xl bg-white/95 px-5 py-4 text-neutral-900 outline-none md:col-span-2"
                  placeholder={
                    selectedService === "TripMixer AI"
                      ? "Es. Weekend romantico in Toscana con spa e degustazioni"
                      : "Dove vuoi andare? Es. Roma, Toscana, Ferrara..."
                  }
                />

                <input
                  type="date"
                  className="rounded-2xl bg-white/95 px-5 py-4 text-neutral-900 outline-none"
                />

                {isStaySearch && (
                  <input
                    type="date"
                    className="rounded-2xl bg-white/95 px-5 py-4 text-neutral-900 outline-none"
                  />
                )}

                <button
                  type="button"
                  onClick={handleSearch}
                  className="rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-600 px-5 py-4 font-bold text-white transition hover:opacity-90"
                >
                  {selectedService === "TripMixer AI"
                    ? "CREA IL TUO VIAGGIO"
                    : "CERCA"}
                </button>
              </div>

              <p className="mt-4 text-sm text-white/75">
                Modalità selezionata: {selectedService}
              </p>

              {loading && (
                <p className="mt-4 text-sm text-white/75">
                  Caricamento servizi Loove...
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {hasSearched && (
        <section className="mx-auto max-w-7xl px-6 py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-pink-500">
            Risultati {selectedService}
          </p>

          <h2 className="mb-10 text-4xl font-bold md:text-5xl">
            {results.length > 0
              ? `Proposte disponibili per "${
                  submittedDestination || "Italia"
                }"`
              : "Nessuna proposta trovata"}
          </h2>

          {results.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {results.map((hotel) => (
                <article
                  key={hotel.id}
                  className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="h-72 w-full object-cover"
                  />

                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full bg-pink-500 px-3 py-1 text-xs font-bold text-white">
                        LOOVE VERIFIED
                      </span>

                      <span className="text-sm text-neutral-500">
                        {hotel.region}
                      </span>
                    </div>

                    <h3 className="mb-2 text-2xl font-bold">{hotel.name}</h3>

                    <p className="mb-2 text-sm font-semibold text-neutral-500">
                      {hotel.type} · {hotel.destination}
                    </p>

                    <p className="mb-4 text-2xl font-bold text-neutral-900">
                      da €{hotel.startingPrice}
                      <span className="text-sm font-medium text-neutral-500">
                        {" "}
                        / notte
                      </span>
                    </p>

                    <p className="mb-6 leading-7 text-neutral-600">
                      {hotel.description}
                    </p>

                    <button
                      onClick={() => navigate(`/hotel/${hotel.id}`)}
                      className="rounded-full border border-pink-500 px-5 py-3 text-sm font-bold text-pink-500 transition hover:bg-pink-500 hover:text-white"
                    >
                      Vedi proposta
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-lg text-neutral-600">
              Prova a cercare Ferrara, Toscana o Roma.
            </p>
          )}
        </section>
      )}

      <section className="bg-neutral-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-pink-500">
            Loover Community
          </p>

          <h2 className="mb-12 text-4xl font-bold md:text-5xl">
            Scopri i consigli di viaggio
            <br />
            dei nostri Loover
          </h2>

          <div className="grid gap-6 md:grid-cols-4">
            {["Roma", "Dolomiti", "Sicilia", "Costiera"].map((place) => (
              <div
                key={place}
                className="relative h-[420px] overflow-hidden rounded-[32px] bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop')",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                <div className="absolute left-5 top-5 rounded-full bg-pink-500 px-3 py-1 text-xs font-bold text-white">
                  VERIFIED LOOVER
                </div>

                <div className="absolute bottom-0 p-6 text-white">
                  <p className="mb-2 text-sm text-white/70">Travel Story</p>
                  <h3 className="mb-2 text-2xl font-bold">{place}</h3>
                  <p className="text-sm text-white/80">
                    Mini itinerari, esperienze e consigli autentici.
                  </p>
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