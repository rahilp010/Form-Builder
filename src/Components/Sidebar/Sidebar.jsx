import { useState } from 'react'
import { useFormStore } from '../../Store/formStore'
import { FIELD_CATEGORIES } from '../../data/fieldDefinitions'
import { motion, AnimatePresence } from 'motion/react'
import { LuSearch, LuChevronDown, LuGripVertical } from 'react-icons/lu'

export default function Sidebar() {
  const addField = useFormStore((s) => s.addField)
  const [search, setSearch] = useState('')
  const [openCats, setOpenCats] = useState(FIELD_CATEGORIES.map((c) => c.id))

  const toggleCategory = (id) => {
    setOpenCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const filteredCategories = FIELD_CATEGORIES.map((cat) => ({
    ...cat,
    fields: cat.fields.filter(
      (f) =>
        f.label.toLowerCase().includes(search.toLowerCase()) ||
        f.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.fields.length > 0)

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="shrink-0 flex flex-col border-r overflow-hidden select-none"
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Search */}
      <div className="p-3 pb-2">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
          }}
        >
          <LuSearch size={15} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search controls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div className="px-3 pb-1">
        <p className="text-[10px] leading-tight text-center py-1 rounded" style={{ color: 'var(--text-muted)', background: 'var(--surface-2)' }}>
          Click or drag controls into canvas
        </p>
      </div>

      {/* Field categories */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {filteredCategories.map((cat, catIdx) => (
          <div key={cat.id} className="mb-1">
            {/* Category header */}
            <button
              onClick={() => toggleCategory(cat.id)}
              className="flex items-center justify-between w-full py-2 px-1 text-left group"
            >
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                {cat.label}
              </span>
              <motion.div
                animate={{ rotate: openCats.includes(cat.id) ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <LuChevronDown
                  size={14}
                  style={{ color: 'var(--text-muted)' }}
                />
              </motion.div>
            </button>

            {/* Fields */}
            <AnimatePresence initial={false}>
              {openCats.includes(cat.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-1.5 pb-2">
                    {cat.fields.map((field, i) => (
                      <FieldCard
                        key={field.type}
                        field={field}
                        delay={catIdx * 0.05 + i * 0.03}
                        onAdd={() => addField(field.type)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.aside>
  )
}

function FieldCard({ field, delay, onAdd }) {
  const Icon = field.icon
  const setDragState = useFormStore((s) => s.setDragState)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e) => {
    const payload = JSON.stringify({ source: 'sidebar', type: field.type })
    setDragState(true, { source: 'sidebar', type: field.type })
    try {
      e.dataTransfer.setData('application/json', payload)
      e.dataTransfer.setData('text/plain', payload)
    } catch {}
    e.dataTransfer.effectAllowed = 'all'
    requestAnimationFrame(() => setIsDragging(true))
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setTimeout(() => {
      setDragState(false, null)
    }, 120)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onAdd}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-150 group text-center ${
        isDragging ? 'opacity-40 scale-95 ring-2 ring-accent' : ''
      }`}
      style={{
        background: 'var(--surface-2)',
        border: '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.background = 'var(--accent-soft)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.borderColor = 'transparent'
          e.currentTarget.style.background = 'var(--surface-2)'
        }
      }}
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center transition-colors duration-150"
        style={{ color: 'var(--accent)' }}
      >
        <Icon size={18} />
      </div>
      <span
        className="text-[11px] font-medium leading-tight"
        style={{ color: 'var(--text-secondary)' }}
      >
        {field.label}
      </span>
      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-40 transition-opacity">
        <LuGripVertical size={11} style={{ color: 'var(--text-muted)' }} />
      </div>
    </motion.div>
  )
}
