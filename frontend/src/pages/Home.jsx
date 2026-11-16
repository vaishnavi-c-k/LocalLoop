import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="hero">
      <h1>Find trusted local services</h1>
      <p>LocalLoop connects customers with service providers in their neighbourhood.</p>
      <div className="hero-actions">
        <Link to="/register?role=customer" className="btn">I need a service</Link>
        <Link to="/register?role=provider" className="btn btn-outline">I offer a service</Link>
      </div>
    </div>
  )
}
