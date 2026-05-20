import type { LooveHotel, LooveRoom } from "./looveData"

export type LooveBookingProof = {
  bookingId: string
  createdAt: string
  status: "DEMO_CONFIRMED"
  hotel: {
    id: number
    name: string
    destination: string
    region: string
  }
  room: {
    roomId: string
    roomName: string
    price: number
    currency: string
  }
  stay: {
    checkIn: string
    checkOut: string
    nights: number
  }
  total: {
    amount: number
    currency: string
  }
  source: {
    platform: "Loove Italy"
    ecosystem: "Hologys"
    nextStep: "IPFS + Camino booking proof"
  }
}

export function createDemoBookingProof(params: {
  hotel: LooveHotel
  room: LooveRoom
  checkIn: string
  checkOut: string
  nights: number
  total: number
}): LooveBookingProof {
  const now = new Date()

  return {
    bookingId: `LOOVE-${now.getFullYear()}-${Date.now()}`,
    createdAt: now.toISOString(),
    status: "DEMO_CONFIRMED",
    hotel: {
      id: params.hotel.id,
      name: params.hotel.name,
      destination: params.hotel.destination,
      region: params.hotel.region,
    },
    room: {
      roomId: params.room.roomId,
      roomName: params.room.roomName,
      price: params.room.price,
      currency: params.room.currency,
    },
    stay: {
      checkIn: params.checkIn || "demo-check-in",
      checkOut: params.checkOut || "demo-check-out",
      nights: params.nights,
    },
    total: {
      amount: params.total,
      currency: params.room.currency,
    },
    source: {
      platform: "Loove Italy",
      ecosystem: "Hologys",
      nextStep: "IPFS + Camino booking proof",
    },
  }
}