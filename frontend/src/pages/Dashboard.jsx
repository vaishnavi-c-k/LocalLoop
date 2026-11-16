import { useAuth } from '../context/useAuth'

// Placeholder page so you can confirm login works. Other members will build on this.
export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="auth-card">
      <h2>Hello, {user.name} 👋</h2>
      <p>
        You are logged in as a <strong>{user.role}</strong>.
      </p>
      <p>{user.email}</p>
      {user.role === 'provider' && (
        <p>
          {user.businessName} · {user.serviceCategory}
        </p>
      )}
    </div>
  )
}
