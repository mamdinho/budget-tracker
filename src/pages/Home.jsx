import { Link } from 'react-router-dom';
import './home.css';

function AnimatedDashboard() {
  return (
    <div className="anim-card shadow-sm rounded-4 p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="fw-semibold">Monthly Income vs Expense</div>
        <span className="badge text-bg-light-subtle">Preview</span>
      </div>

      {/* Bars */}
      <div className="bars d-flex align-items-end gap-2 mb-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bar">
            <span className="bar-income" style={{ '--d': `${i * 0.12}s` }} />
            <span className="bar-expense" style={{ '--d': `${i * 0.12 + 0.06}s` }} />
          </div>
        ))}
      </div>

      {/* Donut */}
      <div className="donut-wrap">
        <div className="donut" />
        <div className="donut-label">
          <div className="small text-muted">Balance</div>
          <div className="fw-semibold">$2,925</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <section className="hero position-relative overflow-hidden">
      {/* animated background */}
      <div className="hero-aurora">
        <span className="aurora a1" />
        <span className="aurora a2" />
        <span className="aurora a3" />
      </div>

      <div className="container position-relative py-5">
        <div className="row align-items-center gy-5">
          {/* Left: copy + CTAs */}
          <div className="col-12 col-lg-6">
            <div className="glass p-4 p-lg-5 rounded-4 shadow-sm">
              <h1 className="display-5 fw-bold mb-3">Budget Tracker</h1>
              <p className="lead text-secondary mb-4">
                Track income and expenses, visualize spending trends, and stay on target
              </p>

              <ul className="hero-points mb-4">
                <li>Fast entry with categories & filters</li>
                <li>Insightful charts (monthly & category)</li>
                <li>CSV export, pagination, dark mode</li>
              </ul>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/register" className="btn btn-primary btn-lg px-4 lift">Get started</Link>
                <Link to="/login" className="btn btn-outline-primary btn-lg px-4">Login</Link>
              </div>
            </div>
          </div>

          {/* Right: animated dashboard mock */}
          <div className="col-12 col-lg-6">
            <AnimatedDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}
