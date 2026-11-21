import { useState } from 'react'
import { useFormStore } from '../../Store/formStore'
import { Button } from '@rahilp010/custom-control'
import { motion, AnimatePresence } from 'motion/react'
import {
  LuX, LuPlus, LuSearch, LuCalendar, LuInbox,
  LuExternalLink, LuCopy, LuCheck, LuTrash2,
  LuPenLine, LuShare2, LuFileText, LuSparkles
} from 'react-icons/lu'

export default function FormsManagerModal({ isOpen, onClose }) {
  const currentFormId = useFormStore((s) => s.formId)
  const savedForms = useFormStore((s) => s.savedForms)
  const responses = useFormStore((s) => s.responses)
  const loadForm = useFormStore((s) => s.loadForm)
  const createNewForm = useFormStore((s) => s.createNewForm)
  const setActiveView = useFormStore((s) => s.setActiveView)
  const deleteForm = useFormStore((s) => s.deleteForm)

  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  if (!isOpen) return null

  const formsArray = Object.values(savedForms || {}).sort((a, b) =>
    new Date(b.savedAt || 0) - new Date(a.savedAt || 0)
  )

  const filteredForms = formsArray.filter((f) =>
    (f.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectForm = (id) => {
    loadForm(id)
    setActiveView('editor')
    onClose()
  }

  const handleCreateNew = () => {
    createNewForm()
    onClose()
  }

  const handleCopyLink = (id, e) => {
    e.stopPropagation()
    const fillUrl = `${window.location.origin}${window.location.pathname}#fill=${id}`
    navigator.clipboard.writeText(fillUrl)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteForm = (form, e) => {
    e.stopPropagation()
    const label = form.title || 'Untitled Form'
    const ok = window.confirm(
      `Delete "${label}"?\n\nThis removes the form and all of its responses. This cannot be undone.`
    )
    if (!ok) return
    deleteForm(form.id)
  }

  const totalSubmissions = Object.values(responses || {}).reduce(
    (acc, list) => acc + (list?.length || 0),
    0
  )

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          className="relative w-full max-w-4xl rounded-3xl p-6 sm:p-8 border z-10 shadow-2xl flex flex-col max-h-[88vh]"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b mb-6" style={{ borderColor: 'var(--border)' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">My Forms</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-accent  text-accent ">
                  {formsArray.length} {formsArray.length === 1 ? 'form' : 'forms'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Manage, duplicate, share, and track all your forms and submissions (Cognito Forms style)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                startIcon={<LuPlus size={16} />}
                onClick={handleCreateNew}
              >
                Create New Form
              </Button>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <LuX size={18} />
              </button>
            </div>
          </div>

          {/* Search bar & Stats */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 max-w-md"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border)',
              }}
            >
              <LuSearch size={15} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search forms by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs flex-1 outline-none"
              />
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <LuInbox size={14} className="text-accent" />
                <strong>{totalSubmissions}</strong> total submissions
              </span>
            </div>
          </div>

          {/* Forms Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredForms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredForms.map((form) => {
                  const isCurrent = form.id === currentFormId
                  const respCount = (responses[form.id] || []).length
                  const fieldsCount = form.fields?.length || 0

                  return (
                    <motion.div
                      key={form.id}
                      whileHover={{ y: -2 }}
                      onClick={() => handleSelectForm(form.id)}
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer group ${
                        isCurrent
                          ? 'border-accent ring-2 ring-accent/25'
                          : 'hover:border-accent'
                      }`}
                      style={{
                        background: 'var(--surface-2)',
                        borderColor: isCurrent ? 'var(--accent)' : 'var(--border)',
                      }}
                    >
                      {/* Top badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isCurrent
                              ? 'bg-accent text-white'
                              : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                          }`}
                        >
                          {isCurrent ? 'Currently Active' : 'Saved Form'}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <LuCalendar size={12} />
                          <span>
                            {form.savedAt
                              ? new Date(form.savedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'Recent'}
                          </span>
                        </div>
                      </div>

                      {/* Title & description */}
                      <h4 className="font-bold text-base leading-tight group-hover:text-accent dark:group-hover:text-accent transition-colors mb-1">
                        {form.title || 'Untitled Form'}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                        {form.description || 'No description provided.'}
                      </p>

                      {/* Stats & Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-800 text-xs">
                        <div className="flex items-center gap-3 text-gray-400">
                          <span>{fieldsCount} fields</span>
                          <span>•</span>
                          <span className="font-semibold text-accent ">
                            {respCount} submissions
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleCopyLink(form.id, e)}
                            title="Copy shareable link"
                            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-900"
                          >
                            {copiedId === form.id ? <LuCheck size={14} className="text-emerald-500" /> : <LuShare2 size={14} />}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteForm(form, e)}
                            title="Delete this form"
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-gray-400 hover:text-red-500"
                          >
                            <LuTrash2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectForm(form.id)
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-accent hover:bg-accent  transition-colors"
                          >
                            <LuPenLine size={13} />
                            Edit
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-2xl" style={{ borderColor: 'var(--border)' }}>
                <LuFileText size={32} className="mx-auto text-gray-400 mb-3" />
                <h4 className="font-bold text-base mb-1">No forms found</h4>
                <p className="text-xs text-gray-400 mb-5">
                  {search ? 'No forms match your search filter.' : 'Click below to create your first form.'}
                </p>
                <Button variant="primary" size="sm" onClick={handleCreateNew}>
                  Create New Form
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
