import { useState } from 'react'
import { useFormStore } from '../../Store/formStore'
import { Button } from '@rahilp010/custom-control'
import { motion, AnimatePresence } from 'motion/react'
import {
  LuArrowLeft, LuDownload, LuTrash2, LuInbox,
  LuSearch, LuFileSpreadsheet, LuFileCode, LuEye,
  LuClock, LuCalendar, LuX, LuShare2, LuCheck
} from 'react-icons/lu'

export default function FormResponses() {
  const formId = useFormStore((s) => s.formId)
  const formTitle = useFormStore((s) => s.formTitle)
  const fields = useFormStore((s) => s.fields)
  const responses = useFormStore((s) => s.responses)
  const setActiveView = useFormStore((s) => s.setActiveView)
  const exportResponsesCSV = useFormStore((s) => s.exportResponsesCSV)
  const clearResponses = useFormStore((s) => s.clearResponses)
  const deleteResponse = useFormStore((s) => s.deleteResponse)

  const [search, setSearch] = useState('')
  const [selectedResp, setSelectedResp] = useState(null)
  const [copiedLink, setCopiedLink] = useState(false)

  const currentResponses = responses[formId] || []

  // Filter responses by search text
  const filteredResponses = currentResponses.filter((r) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      r.id.toLowerCase().includes(q) ||
      Object.values(r.answers).some((val) =>
        String(val).toLowerCase().includes(q)
      )
    )
  })

  const handleCopyLink = () => {
    const fillUrl = `${window.location.origin}${window.location.pathname}#fill=${formId}`
    navigator.clipboard.writeText(fillUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(currentResponses, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(formTitle || 'form').replace(/\s+/g, '_')}_responses.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatAnswerValue = (val) => {
    if (val === undefined || val === null || val === '') {
      return <span className="text-gray-400 italic">No answer</span>
    }
    if (typeof val === 'boolean') {
      return val ? '✓ Yes' : '✕ No'
    }
    if (Array.isArray(val)) {
      return (
        <span className="flex flex-wrap gap-1">
          {val.map((item, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded text-[11px] bg-accent  text-accent  font-medium"
            >
              {String(item)}
            </span>
          ))}
        </span>
      )
    }
    return String(val)
  }

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      {/* Top action bar */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b backdrop-blur-md"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <button
          onClick={() => setActiveView('editor')}
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80 cursor-pointer"
          style={{ color: 'var(--accent)' }}
        >
          <LuArrowLeft size={16} />
          Back to Editor
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            startIcon={copiedLink ? <LuCheck size={14} /> : <LuShare2 size={14} />}
            onClick={handleCopyLink}
          >
            {copiedLink ? 'Link Copied!' : 'Copy Form Link'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={currentResponses.length === 0}
            startIcon={<LuFileCode size={14} />}
            onClick={handleExportJson}
          >
            JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={currentResponses.length === 0}
            startIcon={<LuFileSpreadsheet size={14} />}
            onClick={() => exportResponsesCSV(formId)}
          >
            Export CSV
          </Button>

          {currentResponses.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all responses for this form?')) {
                  clearResponses(formId)
                }
              }}
              title="Delete all responses"
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LuTrash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-6">
        {/* Header Title & Stats */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold leading-tight">
              {formTitle || 'Untitled Form'} — Responses
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Form ID: <code className="font-mono">{formId}</code> • Live respondent feedback
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="px-4 py-2 rounded-xl border text-center shadow-xs"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Total Submissions
              </p>
              <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                {currentResponses.length}
              </p>
            </div>
            <div
              className="px-4 py-2 rounded-xl border text-center shadow-xs"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Form Fields
              </p>
              <p className="text-xl font-bold">
                {fields.length}
              </p>
            </div>
          </div>
        </div>

        {/* Responses Table or Empty State */}
        {currentResponses.length > 0 ? (
          <div
            className="rounded-2xl border overflow-hidden shadow-xs"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            {/* Search filter bar */}
            <div
              className="p-3 border-b flex items-center justify-between gap-4"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border flex-1 max-w-sm"
                style={{
                  background: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                }}
              >
                <LuSearch size={14} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter responses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-xs flex-1 outline-none"
                />
              </div>

              <span className="text-xs text-gray-400">
                Showing {filteredResponses.length} of {currentResponses.length}
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr
                    className="border-b uppercase text-[10px] font-semibold tracking-wider text-gray-400"
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 whitespace-nowrap">Submitted At</th>
                    {fields.map((f) => (
                      <th key={f.id} className="py-3 px-4 whitespace-nowrap min-w-[150px]">
                        {f.config?.label || f.type}
                      </th>
                    ))}
                    <th className="py-3 px-4 w-20 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {filteredResponses.map((resp, idx) => (
                    <tr
                      key={resp.id}
                      onClick={() => setSelectedResp(resp)}
                      className="hover:bg-accent-soft  cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-mono text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium">
                          <LuClock size={12} className="text-gray-400" />
                          <span>{new Date(resp.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-gray-400 font-normal">
                            • {new Date(resp.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      {fields.map((f) => (
                        <td key={f.id} className="py-3 px-4 max-w-xs truncate">
                          {formatAnswerValue(resp.answers[f.id])}
                        </td>
                      ))}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedResp(resp)}
                            title="View details"
                            className="p-1 rounded text-gray-400 hover:text-accent hover:bg-accent-soft  transition-colors"
                          >
                            <LuEye size={14} />
                          </button>
                          <button
                            onClick={() => deleteResponse(formId, resp.id)}
                            title="Delete submission"
                            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <LuTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyResponsesState
            onTest={() => setActiveView('preview')}
            onCopyLink={handleCopyLink}
            copiedLink={copiedLink}
          />
        )}
      </div>

      {/* Response Detail Inspector Modal */}
      <AnimatePresence>
        {selectedResp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResp(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl p-6 border z-10 max-h-[85vh] flex flex-col shadow-2xl"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b mb-4">
                <div>
                  <h4 className="font-bold text-base">Submission Details</h4>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <LuCalendar size={13} />
                    {new Date(selectedResp.submittedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResp(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <LuX size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {fields.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl border text-xs"
                    style={{
                      background: 'var(--surface-2)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <p className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] mb-1">
                      {f.config?.label || f.type}
                    </p>
                    <div className="text-sm font-medium">
                      {formatAnswerValue(selectedResp.answers[f.id])}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t mt-4 flex justify-end">
                <Button variant="primary" size="sm" onClick={() => setSelectedResp(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EmptyResponsesState({ onTest, onCopyLink, copiedLink }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border-2 border-dashed"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--surface)',
      }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
      >
        <LuInbox size={30} />
      </div>

      <h3 className="text-lg font-bold mb-1">No responses yet</h3>
      <p className="text-xs text-gray-400 max-w-sm mb-6">
        Once respondents complete your form, their submitted data will automatically appear here with full export capabilities.
      </p>

      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" onClick={onTest}>
          Test Form in Preview
        </Button>
        <Button
          variant="outline"
          size="sm"
          startIcon={copiedLink ? <LuCheck size={14} /> : <LuShare2 size={14} />}
          onClick={onCopyLink}
        >
          {copiedLink ? 'Link Copied!' : 'Copy Shareable Link'}
        </Button>
      </div>
    </motion.div>
  )
}
