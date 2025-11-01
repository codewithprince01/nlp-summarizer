import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { reportsApi, summariesApi } from '../lib/api'
import { Upload, FileText, RefreshCcw, Sparkles } from 'lucide-react'

export default function Dashboard({ user }) {
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [submittingText, setSubmittingText] = useState(false)
  const [submittingFile, setSubmittingFile] = useState(false)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(10)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  async function loadReports(p = page) {
    setLoading(true)
    try {
      const { items, total: t, page: srvPage, limit: srvLimit } = await reportsApi.list({ page: p, limit })
      setReports(items)
      setTotal(t || 0)
      if (typeof srvPage === 'number') setPage(srvPage)
      if (typeof srvLimit === 'number') setLimit(srvLimit)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports(page)
  }, [page])

  async function handleCreateText(e) {
    e.preventDefault()
    setSubmittingText(true)
    setError('')
    try {
      const { report } = await reportsApi.createText(text)
      setText('')
      setReports(prev => [report, ...prev])
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create report')
    } finally {
      setSubmittingText(false)
    }
  }

  async function handleUpload(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    if (!file) return alert('Please choose a file first.')
    setSubmittingFile(true)
    setError('')
    try {
      let report
      const nameLower = (file.name || '').toLowerCase()
      const isPdf = file.type === 'application/pdf' || nameLower.endsWith('.pdf')
      const isImage =
        /^image\/(png|jpeg|jpg|webp|tiff|bmp)$/.test(file.type) ||
        ['.png', '.jpg', '.jpeg', '.webp', '.tiff', '.bmp'].some(ext => nameLower.endsWith(ext))

      if (isPdf) {
        const buf = await file.arrayBuffer()
        const solidFile = new File([buf], file.name, { type: file.type || 'application/pdf' })
        ;({ report } = await reportsApi.uploadPdf(solidFile))
      } else if (isImage) {
        ;({ report } = await reportsApi.createImage(file))
      } else {
        throw new Error('Unsupported file type')
      }

      setReports(prev => [report, ...prev])
      if (report?._id) navigate(`/reports/${report._id}`)
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to upload file')
    } finally {
      setSubmittingFile(false)
    }
  }

  async function handleSummarize(id) {
    try {
      const { report } = await summariesApi.generate(id)
      setReports(prev => prev.map(r => (r._id === id ? report : r)))
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to summarize')
    }
  }

  // Animation variants for smooth entry
  const leftSlide = {
    hidden: { opacity: 0, x: -50 },
    show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  }

  const rightSlide = {
    hidden: { opacity: 0, x: 50 },
    show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  }

  const bottomSlide = {
    hidden: { opacity: 0, y: 60 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 py-10 px-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <motion.div
          variants={bottomSlide}
          initial="hidden"
          animate="show"
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold text-blue-700 tracking-tight drop-shadow-sm">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Manage your reports and summaries effortlessly ⚡
          </p>
        </motion.div>

        {/* FORM SECTIONS */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* TEXT REPORT */}
          <motion.section
            variants={leftSlide}
            initial="hidden"
            animate="show"
            className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-in-out"
          >
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-blue-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Create Text Report</h2>
            </div>
            <form onSubmit={handleCreateText} className="space-y-3">
              <textarea
                className="w-full border rounded-xl p-3 h-40 resize-none text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300"
                placeholder="✍️ Paste or type text to summarize..."
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <button
                disabled={submittingText || !text.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full py-3 font-medium shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 cursor-pointer transition-all duration-300 disabled:opacity-60"
              >
                {submittingText ? 'Submitting...' : 'Generate Report'}
              </button>
            </form>
          </motion.section>

          {/* FILE UPLOAD */}
          <motion.section
            variants={rightSlide}
            initial="hidden"
            animate="show"
            className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-in-out"
          >
            <div className="flex items-center gap-2 mb-3">
              <Upload className="text-blue-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Upload File</h2>
            </div>
            <form onSubmit={handleUpload} className="space-y-3" encType="multipart/form-data">
              <input
                type="file"
                accept=".pdf,application/pdf,image/*"
                ref={fileInputRef}
                onChange={e => {
                  setError('')
                  setFile(e.target.files[0])
                }}
                className="block w-full border border-dashed border-gray-300 p-3 rounded-lg cursor-pointer text-gray-600 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300"
              />
              {error && <div className="text-sm text-red-600">{error}</div>}
              {file && <p className="text-sm text-green-600">📄 {file.name} selected</p>}
              <button
                type="button"
                disabled={submittingFile}
                onClick={() => {
                  if (!file) fileInputRef.current?.click()
                  else handleUpload()
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full py-3 font-medium shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 cursor-pointer transition-all duration-300 disabled:opacity-60"
              >
                {submittingFile ? 'Processing...' : (file ? 'Upload File' : 'Choose File')}
              </button>
            </form>
          </motion.section>
        </div>

        {/* REPORT LIST */}
        <motion.section
          variants={bottomSlide}
          initial="hidden"
          animate="show"
          className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-500 ease-in-out"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Reports</h2>
            <button
              onClick={() => loadReports(page)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition"
            >
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>

          {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

          {loading ? (
            <div className="text-gray-500 text-center py-4 animate-pulse">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No reports yet. Start creating!</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {reports.map((r, i) => (
                <motion.li
                  key={r._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-blue-50/50 rounded-xl px-2 transition-all duration-300"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {r.sourceType.toUpperCase()} •{' '}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.status === 'DONE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/reports/${r._id}`}
                      className="px-4 py-1.5 border border-blue-500 text-blue-600 rounded-full text-sm hover:bg-blue-50 hover:scale-105 transition-all"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => handleSummarize(r._id)}
                      className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full text-sm hover:shadow-lg hover:scale-105 transition-all"
                    >
                      <Sparkles size={14} /> Summarize
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
          {/* Pagination controls */}
          {total > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                <span>
                  Showing {((page - 1) * limit) + 1}
                  –{Math.min(page * limit, total)} of {total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border rounded-full disabled:opacity-50"
                >
                  Prev
                </button>
                <span>Page {page}</span>
                <button
                  disabled={page * limit >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 border rounded-full disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
