import { useState } from 'react'
import { useFormStore } from '../../Store/formStore'
import { exportFormToPdf } from '../../utils/exportPdf'
import { motion, AnimatePresence } from 'motion/react'
import {
  LuX, LuCheck, LuCopy, LuFileDown, LuExternalLink,
  LuFileText, LuInbox, LuEye, LuShare2
} from 'react-icons/lu'

export default function SaveModal() {
  const isSavedModalOpen = useFormStore((s) => s.isSavedModalOpen)
  const setIsSavedModalOpen = useFormStore((s) => s.setIsSavedModalOpen)
  const formId = useFormStore((s) => s.formId)
  const formTitle = useFormStore((s) => s.formTitle)
  const formDescription = useFormStore((s) => s.formDescription)
  const fields = useFormStore((s) => s.fields)
  const setActiveView = useFormStore((s) => s.setActiveView)
  const exportJSON = useFormStore((s) => s.exportJSON)
  const responses = useFormStore((s) => s.responses)

  const [copied, setCopied] = useState(false)

  if (!isSavedModalOpen) return null

  // Generate public fill link with hash routing
  const fillUrl = `${window.location.origin}${window.location.pathname}#fill=${formId}`
  const responseCount = (responses[formId] || []).length

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fillUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPdf = () => {
    exportFormToPdf({
      title: formTitle,
      description: formDescription,
      fields,
    })
  }

  const handleDownloadJson = () => {
    const json = exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(formTitle || 'form').replace(/\s+/g, '_')}_schema.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleGoToResponses = () => {
    setIsSavedModalOpen(false)
    setActiveView('responses')
  }

  const handleGoToPreview = () => {
    setIsSavedModalOpen(false)
    setActiveView('preview')
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSavedModalOpen(false)}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-2xl shadow-2xl p-6 border z-10"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setIsSavedModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LuX size={18} />
          </button>

          {/* Header with success badge */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
              style={{
                background: 'var(--success)',
                color: 'var(--accent-contrast)',
              }}
            >
              <LuCheck size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">
                Form Saved Successfully!
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                "{formTitle}" • {fields.length} controls • ID: {formId.substring(0, 14)}...
              </p>
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <LuShare2 size={13} style={{ color: 'var(--accent)' }} />
              Shareable Fill Link
            </label>
            <div
              className="flex items-center gap-2 p-2 rounded-xl border transition-all"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border)',
              }}
            >
              <input
                type="text"
                readOnly
                value={fillUrl}
                className="bg-transparent text-xs flex-1 outline-none font-mono select-all px-1"
                style={{ color: 'var(--text-primary)' }}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                style={{
                  background: copied ? 'var(--success)' : 'var(--accent)',
                  color: 'var(--accent-contrast)',
                }}
              >
                {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <a
                href={fillUrl}
                target="_blank"
                rel="noreferrer"
                title="Open public form fill in new tab"
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <LuExternalLink size={15} />
              </a>
            </div>
            <p className="text-[11px] mt-1.5 text-gray-400">
              Anyone with this link can fill and submit the form directly. Responses will appear in your Responses tab!
            </p>
          </div>

          {/* Action Grid (Download PDF, JSON, Responses, Preview) */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            {/* Download PDF */}
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all hover:border-accent hover:bg-accent-soft  group cursor-pointer"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                <LuFileDown size={17} />
              </div>
              <div>
                <p className="text-xs font-semibold leading-tight group-hover:text-accent transition-colors">
                  Download PDF
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Print or save as PDF
                </p>
              </div>
            </button>

            {/* Download JSON */}
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all hover:border-accent hover:bg-accent-soft  group cursor-pointer"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
              >
                <LuFileText size={17} />
              </div>
              <div>
                <p className="text-xs font-semibold leading-tight group-hover:text-accent transition-colors">
                  Export Schema
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  JSON structure
                </p>
              </div>
            </button>

            {/* View Responses */}
            <button
              onClick={handleGoToResponses}
              className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all hover:border-accent hover:bg-accent-soft  group cursor-pointer"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
              >
                <LuInbox size={17} />
              </div>
              <div>
                <p className="text-xs font-semibold leading-tight group-hover:text-accent transition-colors">
                  View Responses
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {responseCount} submission{responseCount !== 1 ? 's' : ''}
                </p>
              </div>
            </button>

            {/* Test in Preview */}
            <button
              onClick={handleGoToPreview}
              className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all hover:border-accent hover:bg-accent-soft  group cursor-pointer"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
              >
                <LuEye size={17} />
              </div>
              <div>
                <p className="text-xs font-semibold leading-tight group-hover:text-accent transition-colors">
                  Test Form
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Preview & submit
                </p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
