import { SimulateError } from '@/model/error/customError'

export const simulateErrors = (progress: number) => {
  const randomValue = Math.random() * 1000

  if (randomValue < 1) {
    return new SimulateError('Nozzle is clogged, figure ruined', { type: 'nozzle' })
  }
  if (randomValue < 4) {
    return new SimulateError('Electricity is down, try again', { type: 'electricity', progress })
  }
  if (randomValue < 9) {
    return new SimulateError('Thread breakage, try again', { type: 'thread', progress })
  }

  return null
}
