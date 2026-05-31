import { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import './Input.css'

export default function Input({
  label,
  error,
  className = '',
  showToggle = false,
  ...props
}) {
  const [visible, setVisible] = useState(false)

  const inputType = showToggle
    ? (visible ? 'text' : 'password')
    : props.type

  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className={showToggle ? 'input-wrapper' : undefined}>
        <input
          className={`input ${error ? 'input-error' : ''} ${className}`.trim()}
          {...props}
          type={inputType}
        />
        {showToggle && (
          <button
            type="button"
            className="input-eye"
            onClick={() => setVisible(v => !v)}
            tabIndex={-1}
          >
            {visible ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
      {error && <span className="input-error-message">{error}</span>}
    </div>
  )
}
