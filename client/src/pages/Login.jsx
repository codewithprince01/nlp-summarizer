import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import { Mail, Lock } from 'lucide-react'
import { motion } from 'framer-motion' // ✅ Add this

export default function Login({ onAuthed }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await authApi.login({ email, password })
      onAuthed(user)
      navigate('/')
    } catch (e) {
      setError(e?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-700 via-sky-600 to-cyan-300 text-gray-800 overflow-hidden">
      {/* Left side - Illustration */}
      <motion.div
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-1 items-center justify-center p-10"
      >
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-xl mb-4">
            NLP Summarizer
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Simplify your content into smart summaries ⚡
          </p>

          <motion.img
            src="https://img.icons8.com/3d-fluency/500/artificial-intelligence.png"
            alt="AI Illustration"
            className="w-[400px] mx-auto rounded-3xl shadow-2xl"
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>

      {/* Right side - Login Card */}
      <motion.div
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-semibold text-center mb-2 text-blue-600">
            Welcome Back 👋
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Login to continue your journey
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-300 rounded-lg px-3 py-2 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                <Mail size={18} className="text-blue-500" />
                <input
                  type="email"
                  className="w-full bg-transparent text-gray-800 outline-none placeholder-gray-400"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                <Lock size={18} className="text-blue-500" />
                <input
                  type="password"
                  className="w-full bg-transparent text-gray-800 outline-none placeholder-gray-400"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg py-3 mt-2 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-sm text-gray-600 mt-6 text-center">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
