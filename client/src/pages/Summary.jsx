import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { reportsApi, summariesApi } from '../lib/api'

export default function Summary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    setError('')
    setLoading(true)
    try {
      const { report } = await reportsApi.get(id)
      setReport(report)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])
  useEffect(() => { window.scrollTo(0, 0) }, [id])

  async function handleSummarize() {
    setBusy(true)
    setError('')
    try {
      const { report } = await summariesApi.generate(id)
      setReport(report)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to summarize')
    } finally {
      setBusy(false)
    }
  }

  const original = report?.originalText || ''
  const summary = report?.summaryText || ''

  async function handleCopy() {
    const text = summary || '(not generated)'
    await navigator.clipboard.writeText(text)
    alert('✅ Summary copied to clipboard!')
  }

  function handleDownload() {
    const text = summary || '(not generated)'
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `summary_${id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Animation Variants
  const leftVariant = {
    hidden: { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0 }
  }

  const rightVariant = {
    hidden: { opacity: 0, x: 80 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 py-10 px-4 transition-all">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 font-medium transition-all cursor-pointer"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3 flex-wrap">
          <button
  onClick={handleCopy}
  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-full shadow-sm 
             hover:bg-blue-500 hover:text-white hover:border-blue-500 
             hover:shadow-blue-500/30 hover:shadow-md hover:scale-[1.05] 
             transition-all duration-300 cursor-pointer"
>
  📋 Copy Summary
</button>

<button
  onClick={handleDownload}
  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-full shadow-sm 
             hover:bg-blue-500 hover:text-white hover:border-blue-500 
             hover:shadow-blue-500/30 hover:shadow-md hover:scale-[1.05] 
             transition-all duration-300 cursor-pointer"
>
  ⬇️ Download Summary
</button>

            {!summary && (
              <button
                onClick={handleSummarize}
                disabled={busy}
                className="px-5 py-2 text-sm bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full font-medium shadow-md hover:shadow-lg hover:scale-[1.04] transition-all duration-300 disabled:opacity-60 cursor-pointer"
              >
                {busy ? 'Generating...' : '✨ Generate Summary'}
              </button>
            )}
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="text-gray-600 text-center py-10 text-lg">Loading report...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* ORIGINAL */}
            <motion.div
              variants={leftVariant}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6"
            >
              <h2 className="text-xl font-semibold text-blue-700 mb-3 border-b pb-2">
                📝 Original Report
              </h2>
              <pre className="whitespace-pre-wrap text-base text-gray-800 leading-relaxed">
                {original}
              </pre>
            </motion.div>

            {/* SUMMARY */}
            <motion.div
              variants={rightVariant}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6"
            >
              <h2 className="text-xl font-semibold text-blue-700 mb-3 border-b pb-2">
                💡 Summary
              </h2>
              {summary ? (
                <pre className="whitespace-pre-wrap text-base text-gray-800 leading-relaxed">
                  {summary}
                </pre>
              ) : (
                <div className="text-gray-600 text-base">
                  No summary yet. Click <b>“Generate Summary”</b> to create one.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
