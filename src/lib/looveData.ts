export type LooveRoom = {
  roomId: string
  roomName: string
  description: string
  price: number
  currency: string
  available: boolean
  maxGuests: number
}

export type LooveExperience = {
  id: string
  title: string
  description: string
  price: number
  currency: string
}

export type LooveHotel = {
  id: number
  name: string
  destination: string
  region: string
  type: string
  description: string
  image: string
  ipfsUri?: string
  startingPrice: number
  currency: string
  rooms: LooveRoom[]
  experiences: LooveExperience[]
}

export const profileUris = [
  "ipfs://QmZbA8RHJA2FQyWHJRpvkZX2iMNNDzRR5Emp6n5n2Doy1Z",
]

export function ipfsToHttp(uri?: string) {
  if (!uri) return ""

  return uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
}

export async function loadLooveHotels(): Promise<LooveHotel[]> {
  const profiles = await Promise.all(
    profileUris.map(async (uri, index) => {
      const res = await fetch(ipfsToHttp(uri))
      const profile = await res.json()

      const rooms: LooveRoom[] =
        profile.inventory?.length > 0
          ? profile.inventory
          : [
              {
                roomId: "DLX-001",
                roomName: "Deluxe Room",
                description:
                  "Camera elegante con comfort premium e servizi selezionati.",
                price: 240,
                currency: "EUR",
                available: true,
                maxGuests: 2,
              },
              {
                roomId: "STE-001",
                roomName: "Junior Suite",
                description:
                  "Suite luminosa ideale per un soggiorno romantico o premium.",
                price: 320,
                currency: "EUR",
                available: true,
                maxGuests: 3,
              },
            ]

      const experiences: LooveExperience[] =
        profile.experiences?.length > 0
          ? profile.experiences
          : [
              {
                id: "EXP-001",
                title: "Esperienza locale selezionata",
                description:
                  "Attività autentica suggerita dal TripMixer per arricchire il soggiorno.",
                price: 85,
                currency: "EUR",
              },
            ]

      const startingPrice = Math.min(...rooms.map((room) => room.price))

      return {
        id: index + 1,
        name: profile.name || "Roma Boutique Suites",
        destination: profile.address?.city || profile.city || "Roma",
        region: profile.address?.region || profile.region || "Lazio",
        type: profile.category || profile.type || "Boutique Hotel",
        description:
          profile.description ||
          "Soggiorno selezionato da Loove Italy con servizi locali, esperienze e possibilità di composizione tramite TripMixer AI.",
        image:
          ipfsToHttp(profile.photos?.[0]) ||
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
        ipfsUri: uri,
        startingPrice,
        currency: rooms[0]?.currency || "EUR",
        rooms,
        experiences,
      }
    })
  )

  return profiles
}