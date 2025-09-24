import { Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Logout from './pages/Logout';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  const { user, signOut } = useAuth();

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
        <div className="container">
          <Link className="navbar-brand fw-semibold" to="/">BudgetTracker</Link>

          <div className="ms-auto d-flex align-items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/app" className="btn btn-sm btn-outline-secondary">Dashboard</Link>
                {/* Immediate sign out button */}
                <button className="btn btn-sm btn-outline-danger" onClick={() => signOut({ global: true })}>
                  Logout
                </button>
                {/* Or link to a full /logout route that shows a page */}
                {/* <Link to="/logout" className="btn btn-sm btn-outline-danger">Logout</Link> */}
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-outline-primary">Login</Link>
                <Link to="/register" className="btn btn-sm btn-primary">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protected app area */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<Dashboard />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
