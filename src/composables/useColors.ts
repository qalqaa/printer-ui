import { colorsLib } from '@/data/static'
import type { IColor } from '@/model/interfaces'

export function useColors(color: string) {
  function colorMatch(): IColor | undefined {
    return colorsLib.find((item) => item.color === color)
  }
  return colorMatch()
}
