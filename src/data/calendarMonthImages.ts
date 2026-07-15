/** Fitness-themed Unsplash images — one per calendar month (0 = January). */
export const calendarMonthImages: Record<number, { image: string; label: string }> = {
  0: {
    label: 'January',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80',
  },
  1: {
    label: 'February',
    image:
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80',
  },
  2: {
    label: 'March',
    image:
      'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=1200&q=80',
  },
  3: {
    label: 'April',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80',
  },
  4: {
    label: 'May',
    image:
      'https://images.unsplash.com/photo-1434682881348-1deda2a010f5?w=1200&q=80',
  },
  5: {
    label: 'June',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
  },
  6: {
    label: 'July',
    image:
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&q=80',
  },
  7: {
    label: 'August',
    image:
      'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=1200&q=80',
  },
  8: {
    label: 'September',
    image:
      'https://images.unsplash.com/photo-1603286561831-8f228e251213?w=1200&q=80',
  },
  9: {
    label: 'October',
    image:
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&q=80',
  },
  10: {
    label: 'November',
    image:
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1200&q=80',
  },
  11: {
    label: 'December',
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b46d2?w=1200&q=80',
  },
}

export function getMonthBackground(month: Date) {
  return calendarMonthImages[month.getMonth()] ?? calendarMonthImages[0]
}
