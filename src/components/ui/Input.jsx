import './Input.css'

export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input
        className={`input ${error ? 'input-error' : ''} ${className}`.trim()}
        {...props}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  )
}
