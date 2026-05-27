import { useState, useRef, useEffect } from 'react'
import { useMentionSuggestions } from '@/hooks/useMentionSuggestions'
import './MentionInput.css'

export default function MentionInput({
  value,
  onChange,
  placeholder,
  rows = 1,
  className = '',
  onKeyDown,
}) {
  const { getSuggestions } = useMentionSuggestions()
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mentionStart, setMentionStart] = useState(-1)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  const detectMention = async (text, cursorPos) => {
    // Busca @ antes del cursor
    const textBeforeCursor = text.slice(0, cursorPos)
    const match = textBeforeCursor.match(/@(\w*)$/)

    if (match) {
      const query = match[1]
      setMentionStart(cursorPos - match[0].length)
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        const results = await getSuggestions(query)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      }, 200)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
      setMentionStart(-1)
    }
  }

  const handleChange = (e) => {
    const text = e.target.value
    const cursor = e.target.selectionStart
    onChange(text)
    detectMention(text, cursor)
  }

  const handleKeyDown = (e) => {
    if (showSuggestions && e.key === 'Escape') {
      setShowSuggestions(false)
    }
    onKeyDown?.(e)
  }

  const handleSelect = (profile) => {
    const before = value.slice(0, mentionStart)
    const after = value.slice(inputRef.current?.selectionStart || mentionStart)
    const newText = `${before}@${profile.username} ${after}`
    onChange(newText)
    setShowSuggestions(false)
    setSuggestions([])
    // Foco al input
    setTimeout(() => {
      if (inputRef.current) {
        const pos = before.length + profile.username.length + 2
        inputRef.current.setSelectionRange(pos, pos)
        inputRef.current.focus()
      }
    }, 0)
  }

  const isTextarea = rows > 1

  return (
    <div className="mention-wrapper">
      {isTextarea ? (
        <textarea
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className={`mention-input ${className}`}
        />
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`mention-input ${className}`}
        />
      )}

      {showSuggestions && (
        <div className="mention-dropdown">
          {suggestions.map(profile => (
            <div
              key={profile.id}
              className="mention-item"
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(profile)
              }}
            >
              <div className="mention-avatar">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt={profile.username} />
                  : profile.username?.charAt(0).toUpperCase()
                }
              </div>
              <div className="mention-info">
                <span className="mention-displayname">
                  {profile.display_name || profile.username}
                </span>
                <span className="mention-handle">@{profile.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}