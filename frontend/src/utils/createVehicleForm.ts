import type { CreateVehicleRequest } from '../types/vehicle'

export interface VehicleFormState {
  make: string
  model: string
  yearOfManufacture: string
  vin: string
  licensePlate: string
  nextInspectionAt: string
}

export const emptyVehicleForm = (): VehicleFormState => ({
  make: '',
  model: '',
  yearOfManufacture: '',
  vin: '',
  licensePlate: '',
  nextInspectionAt: '',
})

export function validateVehicleForm(form: VehicleFormState): string | null {
  if (!form.make.trim()) return 'Brand is required.'
  if (!form.model.trim()) return 'Model is required.'

  if (form.yearOfManufacture.trim()) {
    const year = Number(form.yearOfManufacture)
    if (!Number.isInteger(year) || year < 1886 || year > 2100) {
      return 'Year must be a whole number between 1886 and 2100.'
    }
  }

  return null
}

export function buildCreateVehiclePayload(form: VehicleFormState): CreateVehicleRequest {
  const payload: CreateVehicleRequest = {
    make: form.make.trim(),
    model: form.model.trim(),
  }

  const yearText = form.yearOfManufacture.trim()
  if (yearText) {
    payload.yearOfManufacture = Number(yearText)
  }

  const vin = form.vin.trim()
  if (vin) payload.vin = vin

  const licensePlate = form.licensePlate.trim()
  if (licensePlate) payload.licensePlate = licensePlate

  const inspectionDate = form.nextInspectionAt.trim()
  if (inspectionDate) {
    payload.nextInspectionAt = `${inspectionDate}T00:00:00.000Z`
  }

  return payload
}
