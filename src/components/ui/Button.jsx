import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const baseClass = `btn btn-${variant} btn-${size}`
  const finalClass = `${baseClass} ${className}`.trim()

  return (
    <button
      className={finalClass}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
