import { useEffect, useState } from 'react'
import api from '../api/axios'
import { AuthContext } from './AuthContext'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token'))

  // On page load, restore the session from the saved token
  useEffect(() => {
    if (!localStorage.getItem('token')) return
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const saveSession = (data) => {
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    return saveSession(res.data)
  }

  const registerCustomer = async (form) => {
    const res = await api.post('/auth/register/customer', form)
    return saveSession(res.data)
  }

  const registerProvider = async (form) => {
    const res = await api.post('/auth/register/provider', form)
    return saveSession(res.data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, registerCustomer, registerProvider, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
