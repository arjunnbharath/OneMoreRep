export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center'

export interface TourStep {
  id: string
  title: string
  body: string
  target?: string
  getTarget?: () => string | undefined
  placement?: TourPlacement
  /** Extra space between spotlight and tooltip (px). Default 24 for bottom/top. */
  tooltipGap?: number
  onEnter?: () => void | Promise<void>
}
