// Shared form validators. Each returns an error string ('' = valid).

export const vName = (v) => {
  const s = (v || '').trim()
  if (!s) return 'Name is required'
  if (s.length < 2) return 'Name must be at least 2 characters'
  if (!/^[A-Za-z][A-Za-z .]*$/.test(s)) return 'Name can only contain letters, spaces and dots'
  return ''
}

export const vEmail = (v) => {
  const s = (v || '').trim()
  if (!s) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return 'Enter a valid email address'
  return ''
}

// Indian mobile: 10 digits starting 6-9
export const vPhone = (v, required = true) => {
  const s = (v || '').trim()
  if (!s) return required ? 'Mobile number is required' : ''
  if (!/^[6-9]\d{9}$/.test(s)) return 'Enter a valid 10-digit mobile number'
  return ''
}

export const vPassword = (v) => {
  const s = v || ''
  if (!s) return 'Password is required'
  if (s.length < 6) return 'Password must be at least 6 characters'
  if (!/[A-Za-z]/.test(s) || !/\d/.test(s)) return 'Use at least one letter and one number'
  return ''
}

export const vAge = (v) => {
  if (v === '' || v === null || v === undefined) return 'Age is required'
  const n = Number(v)
  if (!Number.isInteger(n) || n < 1 || n > 120) return 'Enter a valid age (1–120)'
  return ''
}

// Run a map of { field: error } and return it; empty object = all valid
export const collect = (pairs) => {
  const errors = {}
  for (const [field, err] of pairs) if (err) errors[field] = err
  return errors
}
