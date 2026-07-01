interface UserAvatarProps {
  name?: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-base',
  lg: 'h-20 w-20 text-2xl',
  xl: 'h-24 w-24 text-3xl',
}

export default function UserAvatar({
  name,
  avatarUrl,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const initial = name?.charAt(0).toUpperCase() ?? '?'
  const sizeClass = sizeClasses[size]

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ? `${name}'s profile` : 'Profile'}
        className={[
          'shrink-0 rounded-full object-cover ring-1 ring-border',
          sizeClass,
          className,
        ].join(' ')}
      />
    )
  }

  return (
    <div
      className={[
        'flex shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground',
        sizeClass,
        className,
      ].join(' ')}
    >
      {initial}
    </div>
  )
}
