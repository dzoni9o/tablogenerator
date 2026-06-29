import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Pogrešan email ili lozinka.')
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-head">
          <p>TABLO GENERATOR</p>
          <h1>Prijava</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="korisnik@email.com"
              required
              autoComplete="email"
            />
          </label>

          <label>
            Lozinka
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Prijavljivanje…' : 'Prijavi se'}
          </button>
        </form>
      </div>
    </div>
  )
}
