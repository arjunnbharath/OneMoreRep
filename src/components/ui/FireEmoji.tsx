const FIRE_EMOJI_SRC =
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f525.png'

export default function FireEmoji({ size = 18 }: { size?: number }) {
  return (
    <img
      src={FIRE_EMOJI_SRC}
      alt=""
      width={size}
      height={size}
      className="inline-block shrink-0 select-none pointer-events-none border-0 outline-none"
      aria-hidden="true"
      draggable={false}
    />
  )
}
