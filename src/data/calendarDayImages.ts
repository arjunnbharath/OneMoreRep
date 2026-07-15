import { calendarMonthImages } from './calendarMonthImages'
import { WEEKDAYS, type Weekday } from '../types/workoutPlan'

/** Mon–Sun use the first seven month images from public/images/calendar/ */
export const calendarDayImages: Record<Weekday, string> = Object.fromEntries(
  WEEKDAYS.map((day, index) => [day, calendarMonthImages[index].image]),
) as Record<Weekday, string>

export function getCalendarDayImage(day: Weekday) {
  return calendarDayImages[day]
}
