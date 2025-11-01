import { useEffect, useState, useRef } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { authApi } from './lib/api.js'

import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Summary from './pages/Summary.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // ✅ Navbar scroll color change
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ✅ Scroll to top on route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // ✅ Close dropdown when clicked outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // ✅ Get user session
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { user } = await authApi.me()
        if (mounted) setUser(user)
      } catch {
        try {
          await authApi.refresh()
          const { user } = await authApi.me()
          if (mounted) setUser(user)
        } catch {}
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  async function handleLogout() {
    setMenuOpen(false)
    await authApi.logout()
    setUser(null)
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-lg font-medium">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white shadow-md'
            : 'bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 shadow-lg'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4 transition-all duration-500">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`text-3xl font-extrabold tracking-wide transition-all duration-500 cursor-pointer ${
              scrolled
                ? 'text-blue-700 hover:text-blue-600'
                : 'text-white hover:text-blue-100'
            }`}
          >
            🌐 NLP Clinic
          </Link>

          <nav className="space-x-4 flex items-center">
            {user ? (
              <>
                {/* ✅ User Menu Only */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                      scrolled
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all ${
                        scrolled
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-blue-700'
                      }`}
                    >
                      {(user?.name || user?.email || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {user?.name || user?.email || 'User'}
                    </span>
                  </button>

                  {/* ✅ Logout dropdown */}
                  <div
                    className={`absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md transition-all duration-300 origin-top-right ${
                      menuOpen
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-all cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`relative font-semibold px-6 py-2 rounded-full shadow-md transform hover:scale-110 transition-all duration-300 cursor-pointer ${
                    scrolled
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-blue-700 hover:shadow-blue-300'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`relative font-semibold px-6 py-2 rounded-full shadow-md transform hover:scale-110 transition-all duration-300 cursor-pointer ${
                    scrolled
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-blue-700 hover:shadow-blue-300'
                  }`}
                >
                  Signup
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ✅ Page content area */}
      <main className="flex-1 bg-gradient-to-b from-gray-50 via-blue-50 to-white min-h-screen transition-colors duration-700">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login onAuthed={setUser} />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" replace /> : <Signup onAuthed={setUser} />}
          />

          <Route element={<ProtectedRoute user={user} />}>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/reports/:id" element={<Summary />} />
          </Route>

          <Route
            path="*"
            element={<Navigate to={user ? '/' : '/login'} replace />}
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
