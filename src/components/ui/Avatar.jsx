import './Avatar.css'

export default function Avatar({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  className = '',
}) {
  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <div className={`avatar avatar-${size} ${className}`.trim()}>
      {src ? (
        <img src={src} alt={alt} className="avatar-img" />
      ) : (
        <div className="avatar-fallback">{initials}</div>
      )}
    </div>
  )
}
