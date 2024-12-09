import type { ICoil, IFigure, IPrinter } from './interfaces'

type Meter = number
type Millimeter = number
type MillimeterPerSecond = number

type EntityType = IPrinter | ICoil | IFigure

export type { EntityType, Meter, Millimeter, MillimeterPerSecond }
