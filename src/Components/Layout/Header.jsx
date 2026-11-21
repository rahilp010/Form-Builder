import { useState } from 'react'
import { useFormStore } from '../../Store/formStore'
import { exportFormToPdf } from '../../utils/exportPdf'
import { Button } from '@rahilp010/custom-control'
import { motion } from 'motion/react'
import {
  LuTrash2,
  LuPanelRightClose,
  LuPanelRightOpen,
  LuCode,
  LuFileDown,
  LuSave,
  LuPenLine,
  LuLayers,
  LuChevronDown,
} from 'react-icons/lu'
import FormsManagerModal from '../FormsManager/FormsManagerModal'
import CodeExportModal from '../CodeModal/CodeExportModal'
import ViewSwitcher from './ViewSwitcher'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const activeView = useFormStore((s) => s.activeView)
  const showProperties = useFormStore((s) => s.showProperties)
  const setShowProperties = useFormStore((s) => s.setShowProperties)
  const fields = useFormStore((s) => s.fields)
  const clearAll = useFormStore((s) => s.clearAll)
  const formTitle = useFormStore((s) => s.formTitle)
  const setFormTitle = useFormStore((s) => s.setFormTitle)
  const formDescription = useFormStore((s) => s.formDescription)
  const saveCurrentForm = useFormStore((s) => s.saveCurrentForm)

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isFormsModalOpen, setIsFormsModalOpen] = useState(false)
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)

  const isDashboard = activeView === 'dashboard'

  const handleExportPdf = () => {
    exportFormToPdf({
      title: formTitle,
      description: formDescription,
      fields,
    })
  }

  return (
    <>
      <motion.header
        initial={{ y: -56, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="app-header h-14 flex items-center justify-between gap-3 px-4 sm:px-6 border-b shrink-0 z-40 relative"
      >
        {isDashboard ? (
          /* Dashboard — website name only */
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-semibold text-sm shrink-0 shadow-xs"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-contrast)',
              }}
            >
              F
            </div>
            <span
              className="font-display text-[17px] font-semibold tracking-tight truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              FormBuilder
            </span>
          </div>
        ) : (
          /* Editor views — forms switcher & editable form title */
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-semibold text-sm shrink-0 shadow-xs"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-contrast)',
              }}
            >
              F
            </div>

            <button
              type="button"
              onClick={() => setIsFormsModalOpen(true)}
              title="Switch or manage forms"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-secondary)] hover:border-accent hover:text-accent transition-colors cursor-pointer"
            >
              <LuLayers size={14} className="text-accent" />
              <span>My Forms</span>
              <LuChevronDown
                size={12}
                style={{ color: 'var(--text-muted)' }}
              />
            </button>

            <div
              className="w-px h-5 hidden sm:block"
              style={{ background: 'var(--border)' }}
            />

            <div className="flex items-center gap-1.5 group max-w-xs sm:max-w-sm">
              {isEditingTitle ? (
                <input
                  type="text"
                  autoFocus
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && setIsEditingTitle(false)
                  }
                  className="text-sm font-semibold px-2 py-0.5 rounded-md border outline-none bg-[var(--surface-2)]"
                  style={{
                    borderColor: 'var(--accent)',
                    color: 'var(--text-primary)',
                  }}
                />
              ) : (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  title="Click to rename form"
                  className="flex items-center gap-1.5 text-left py-0.5 px-1.5 rounded-md hover:bg-[var(--surface-2)] transition-colors"
                >
                  <span
                    className="text-sm font-semibold leading-tight truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formTitle || 'Untitled Form'}
                  </span>
                  <LuPenLine
                    size={12}
                    className="opacity-0 group-hover:opacity-70 transition-opacity shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                  />
                </button>
              )}

              <span
                className="text-[11px] hidden md:inline-block px-1.5 py-0.5 rounded"
                style={{
                  color: 'var(--text-muted)',
                  background: 'var(--surface-2)',
                }}
              >
                {fields.length} {fields.length === 1 ? 'field' : 'fields'}
              </span>
            </div>
          </div>
        )}

        {/* iOS-style segmented control — the dashboard uses the floating dock */}
        {!isDashboard && <ViewSwitcher variant="inline" />}

        <div className="flex items-center gap-1.5">
          {!isDashboard && (
            <>
              <Button
                variant="primary"
                size="sm"
                startIcon={<LuSave size={14} />}
                onClick={saveCurrentForm}
              >
                Save Form
              </Button>

              <button
                onClick={() => setIsCodeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-accent hover:text-accent cursor-pointer"
                title="Export and copy React component code"
              >
                <LuCode size={15} />
                <span>Copy Code</span>
              </button>

              <button
                onClick={handleExportPdf}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-accent hover:text-accent cursor-pointer"
                title="Download PDF or print form"
              >
                <LuFileDown size={15} />
                <span className="hidden sm:inline">PDF</span>
              </button>

              {activeView === 'editor' && (
                <button
                  onClick={() => setShowProperties(!showProperties)}
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--surface-2)]"
                  style={{ color: 'var(--text-secondary)' }}
                  title={
                    showProperties
                      ? 'Hide properties panel'
                      : 'Show properties panel'
                  }
                >
                  {showProperties ? (
                    <LuPanelRightClose size={17} />
                  ) : (
                    <LuPanelRightOpen size={17} />
                  )}
                </button>
              )}

              {fields.length > 0 && activeView === 'editor' && (
                <button
                  onClick={() => {
                    if (confirm('Clear all form fields?')) clearAll()
                  }}
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--danger-soft)]"
                  style={{ color: 'var(--danger)' }}
                  title="Clear all fields"
                >
                  <LuTrash2 size={17} />
                </button>
              )}

              <div
                className="w-px h-5 mx-1"
                style={{ background: 'var(--border)' }}
              />
            </>
          )}

          <ThemeToggle />
        </div>
      </motion.header>

      <FormsManagerModal
        isOpen={isFormsModalOpen}
        onClose={() => setIsFormsModalOpen(false)}
      />

      <CodeExportModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </>
  )
}
