export interface CreateVehicleRequest {
  make: string
  model: string
  yearOfManufacture?: number
  vin?: string
  licensePlate?: string
  nextInspectionAt?: string | null
}

export interface UpdateInspectionDateRequest {
  nextInspectionAt: string
}

export interface VehicleResponse {
  id: string
  make: string
  model: string
  yearOfManufacture: number | null
  vin: string | null
  licensePlate: string | null
  ownerId: string
  nextInspectionAt: string | null
  lastInspectionReminderAt: string | null
  createdAt: string
  updatedAt: string
}
