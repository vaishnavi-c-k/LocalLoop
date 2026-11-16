import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  city: '',
  businessName: '',
  serviceCategory: '',
  description: '',
}

export default function Register() {
  const { user, registerCustomer, registerProvider } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [role, setRole] = useState(params.get('role') === 'provider' ? 'provider' : 'customer')
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')

    const { confirmPassword, ...data } = form // eslint-disable-line no-unused-vars
    setSubmitting(true)
    try {
      if (role === 'provider') {
        await registerProvider(data)
      } else {
        const { businessName, serviceCategory, description, ...customerData } = data // eslint-disable-line no-unused-vars
        await registerCustomer(customerData)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h2>Create your account</h2>

      <div className="role-toggle">
        <button
          type="button"
          className={role === 'customer' ? 'active' : ''}
          onClick={() => setRole('customer')}
        >
          Customer
        </button>
        <button
          type="button"
          className={role === 'provider' ? 'active' : ''}
          onClick={() => setRole('provider')}
        >
          Service Provider
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label>Full name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />

        <label>City</label>
        <input name="city" value={form.city} onChange={handleChange} />

        {role === 'provider' && (
          <>
            <label>Business name</label>
            <input
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              required
            />

            <label>Service category</label>
            <select
              name="serviceCategory"
              value={form.serviceCategory}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Cleaning</option>
              <option>Carpentry</option>
              <option>Painting</option>
              <option>Tutoring</option>
              <option>Beauty & Salon</option>
              <option>Other</option>
            </select>

            <label>Short description</label>
            <textarea
              name="description"
              rows="3"
              maxLength="500"
              value={form.description}
              onChange={handleChange}
            />
          </>
        )}

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <label>Confirm password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        {error && <p className="error">{error}</p>}

        <button className="btn full" type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : `Sign up as ${role}`}
        </button>
      </form>
      <p className="switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
