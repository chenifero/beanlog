import './Spinner.css'

export default function Spinner({ size = 'md' }) {
  return (
    <div className={`spinner spinner-${size}`} aria-label="Loading">
      <div className="spinner-ring"></div>
    </div>
  )
}
