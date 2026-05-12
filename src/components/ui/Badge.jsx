import './Badge.css'

export default function Badge({
  children,
  variant = 'default',
  className = '',
  ...props
}) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()} {...props}>
      {children}
    </span>
  )
}
