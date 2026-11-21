import { useState } from 'react'
import { useFormStore } from '../../Store/formStore'
import { generateReactCode } from '../../utils/generateReactCode'
import { motion, AnimatePresence } from 'motion/react'
import {
  LuX, LuCheck, LuCopy, LuDownload, LuCode,
  LuFileCode, LuBraces, LuGlobe
} from 'react-icons/lu'

export default function CodeExportModal({ isOpen, onClose }) {
  const formTitle = useFormStore((s) => s.formTitle)
  const formDescription = useFormStore((s) => s.formDescription)
  const fields = useFormStore((s) => s.fields)
  const exportJSON = useFormStore((s) => s.exportJSON)

  const [activeTab, setActiveTab] = useState('react')
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const reactCode = generateReactCode({
    title: formTitle,
    description: formDescription,
    fields,
  })

  const jsonCode = exportJSON()

  const htmlEmbedCode = `<!-- FormBuilder Embed Code -->
<div id="form-container"></div>
<script type="module">
  // Embed Form: ${formTitle || 'Untitled Form'}
  console.log('Embed form initialized');
</script>`

  const currentCode = activeTab === 'react' ? reactCode : activeTab === 'json' ? jsonCode : htmlEmbedCode

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const ext = activeTab === 'react' ? 'jsx' : activeTab === 'json' ? 'json' : 'html'
    const mime = activeTab === 'react' ? 'text/javascript' : activeTab === 'json' ? 'application/json' : 'text/html'
    const blob = new Blob([currentCode], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(formTitle || 'form').replace(/\s+/g, '_')}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

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
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-3xl rounded-2xl p-6 border z-10 shadow-2xl flex flex-col max-h-[90vh]"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-contrast)',
                }}
              >
                <LuFileCode size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">Export & Copy Code</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Production-ready React code powered by <code className="font-mono">@rahilp010/custom-control</code>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <LuX size={18} />
            </button>
          </div>

          {/* Format Tabs & Action Buttons */}
          <div className="flex items-center justify-between py-3">
            <div
              className="flex items-center rounded-xl p-0.5 border gap-1"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
            >
              {[
                { id: 'react', label: 'React JSX', icon: LuCode },
                { id: 'json', label: 'JSON Schema', icon: LuBraces },
                { id: 'html', label: 'HTML Embed', icon: LuGlobe },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    background: activeTab === tab.id ? 'var(--surface-active)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: activeTab === tab.id ? 'var(--shadow-soft)' : 'none',
                  }}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:border-accent transition-colors cursor-pointer"
                style={{
                  background: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <LuDownload size={14} />
                Download File
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                style={{
                  background: copied ? 'var(--success)' : 'var(--accent)',
                  color: 'var(--accent-contrast)',
                }}
              >
                {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
                <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div
            className="flex-1 overflow-auto rounded-xl border p-4 font-mono text-xs leading-relaxed max-h-[460px] select-all"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <pre className="whitespace-pre">{currentCode}</pre>
          </div>

          {/* Footer note */}
          <div className="pt-3 flex items-center justify-between text-[11px] text-gray-400">
            <span>Dependency: npm install @rahilp010/custom-control framer-motion</span>
            <span>{currentCode.split('\n').length} lines • {currentCode.length} characters</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
