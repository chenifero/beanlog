import { useNavigate } from 'react-router-dom'

export default function MentionText({ text, className }) {
  const navigate = useNavigate()
  if (!text) return null

  const parts = text.split(/(@\w+)/g)

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.match(/^@\w+$/)) {
          const username = part.slice(1)
          return (
            <span
              key={i}
              style={{ color: 'var(--amber)', cursor: 'pointer', fontWeight: 600 }}
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/user/${username}`)
              }}
            >
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}