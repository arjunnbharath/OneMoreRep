export default function FireEmoji({ size = 18 }: { size?: number }) {
  return (
    <span
      className="inline-block shrink-0 select-none leading-none"
      style={{
        fontSize: size,
        fontFamily:
          '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", emoji',
      }}
      aria-hidden="true"
    >
      🔥
    </span>
  )
}
