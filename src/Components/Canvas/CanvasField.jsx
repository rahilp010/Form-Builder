import { useState, useRef } from 'react'
import { useFormStore } from '../../Store/formStore'
import { FIELD_REGISTRY } from '../../data/fieldDefinitions'
import FieldRenderer from './FieldRenderer'
import { motion, AnimatePresence } from 'motion/react'
import {
  LuGripVertical, LuCopy, LuTrash2,
  LuChevronUp, LuChevronDown, LuColumns2,
} from 'react-icons/lu'

export default function CanvasField({
  field,
  index,
  totalCount,
}) {
  const selectedFieldId = useFormStore((s) => s.selectedFieldId)
  const fields = useFormStore((s) => s.fields)
  const selectField = useFormStore((s) => s.selectField)
  const removeField = useFormStore((s) => s.removeField)
  const duplicateField = useFormStore((s) => s.duplicateField)
  const moveField = useFormStore((s) => s.moveField)
  const moveFieldRelative = useFormStore((s) => s.moveFieldRelative)
  const moveFieldToRow = useFormStore((s) => s.moveFieldToRow)
  const setFieldColSpan = useFormStore((s) => s.setFieldColSpan)
  const addFieldRelative = useFormStore((s) => s.addFieldRelative)
  const addFieldToRow = useFormStore((s) => s.addFieldToRow)
  const setDragState = useFormStore((s) => s.setDragState)

  const cardRef = useRef(null)
  const lastPositionRef = useRef('below')
  const [isResizing, setIsResizing] = useState(false)
  const [resizeColSpan, setResizeColSpan] = useState(null)
  const [dropIndicator, setDropIndicator] = useState(null) // 'above' | 'below' | 'left' | 'right' | null
  const [isDraggingThis, setIsDraggingThis] = useState(false)

  const isSelected = selectedFieldId === field.id
  const def = FIELD_REGISTRY[field.type]
  const Icon = def?.icon
  const isCheckboxOrToggle = ['checkbox', 'toggle'].includes(field.type)
  const isContentBlock = ['heading', 'richtext', 'image', 'divider'].includes(field.type)

  const colSpan = resizeColSpan !== null ? resizeColSpan : (field.config.colSpan || 12)

  // ── Drag Reordering (Smooth, non-blocking) ───────────────────────
  const handleDragStart = (e) => {
    const payload = JSON.stringify({ source: 'canvas', index, id: field.id })
    setDragState(true, { source: 'canvas', index, id: field.id })
    try {
      e.dataTransfer.setData('application/json', payload)
      e.dataTransfer.setData('text/plain', payload)
    } catch {}
    e.dataTransfer.effectAllowed = 'all'

    // Defer visual state change so the browser captures the crisp initial preview
    requestAnimationFrame(() => {
      setIsDraggingThis(true)
    })
  }

  const handleDragEnd = () => {
    setIsDraggingThis(false)
    setDropIndicator(null)
    setTimeout(() => {
      setDragState(false, null)
    }, 120)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'

    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height

    let position = 'below'
    if (relX < 0.22 && relY > 0.15 && relY < 0.85) {
      position = 'left'
    } else if (relX > 0.78 && relY > 0.15 && relY < 0.85) {
      position = 'right'
    } else if (relY < 0.5) {
      position = 'above'
    } else {
      position = 'below'
    }

    lastPositionRef.current = position
    setDropIndicator(position)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const { clientX, clientY } = e
    if (
      clientX < rect.left ||
      clientX >= rect.right ||
      clientY < rect.top ||
      clientY >= rect.bottom
    ) {
      setDropIndicator(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const indicator = dropIndicator || lastPositionRef.current || 'below'
    setDropIndicator(null)

    let data = null
    try {
      const raw =
        e.dataTransfer?.getData('application/json') ||
        e.dataTransfer?.getData('text/plain')
      if (raw) {
        if (raw.startsWith('{')) {
          data = JSON.parse(raw)
        } else {
          data = { source: 'sidebar', type: raw }
        }
      }
    } catch {}

    if (!data || (!data.type && !data.id)) {
      data = useFormStore.getState().dragItem
    }

    setDragState(false, null)

    if (!data) return

    if (data.source === 'sidebar' && data.type) {
      if (indicator === 'left') {
        addFieldToRow(data.type, field.id, 'before')
      } else if (indicator === 'right') {
        addFieldToRow(data.type, field.id, 'after')
      } else if (indicator === 'above') {
        addFieldRelative(data.type, field.id, 'before')
      } else {
        // 'below'
        addFieldRelative(data.type, field.id, 'after')
      }
    } else if (data.source === 'canvas') {
      const movedId =
        data.id || (data.index !== undefined ? fields[data.index]?.id : null)
      if (!movedId || movedId === field.id) return

      if (indicator === 'left') {
        moveFieldToRow(movedId, field.id, 'before')
      } else if (indicator === 'right') {
        moveFieldToRow(movedId, field.id, 'after')
      } else if (indicator === 'above') {
        moveFieldRelative(movedId, field.id, 'before')
      } else {
        // 'below'
        moveFieldRelative(movedId, field.id, 'after')
      }
    }
  }

  // ── Mouse Drag Resize (Hardware-accelerated RAF) ─────────────────
  const handleResizeMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)

    const startX = e.clientX
    const initialSpan = field.config.colSpan || 12
    const parent = cardRef.current?.parentElement
    const parentWidth = parent ? parent.getBoundingClientRect().width : 800
    const colWidth = parentWidth / 12

    let currentSpan = initialSpan
    let rafId = null

    const handleMouseMove = (moveEvent) => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const deltaX = moveEvent.clientX - startX
        const deltaCols = Math.round(deltaX / colWidth)
        const calculated = Math.max(1, Math.min(12, initialSpan + deltaCols))
        if (calculated !== currentSpan) {
          currentSpan = calculated
          setResizeColSpan(calculated)
        }
      })
    }

    const handleMouseUp = () => {
      if (rafId) cancelAnimationFrame(rafId)
      setIsResizing(false)
      setFieldColSpan(field.id, currentSpan)
      setResizeColSpan(null)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Quick preset toggles
  const quickCycleColSpan = (e) => {
    e.stopPropagation()
    const presets = [12, 6, 4, 3, 8]
    const current = field.config.colSpan || 12
    const currentIdx = presets.indexOf(current)
    const nextSpan = presets[(currentIdx + 1) % presets.length]
    setFieldColSpan(field.id, nextSpan)
  }

  const getPercentageText = (span) => {
    switch (span) {
      case 12: return '100% (Full)'
      case 6: return '50% (Half)'
      case 4: return '33% (1/3)'
      case 3: return '25% (1/4)'
      case 8: return '66% (2/3)'
      case 9: return '75% (3/4)'
      default: return `${Math.round((span / 12) * 100)}%`
    }
  }

  return (
    <motion.div
      ref={cardRef}
      layout
      layoutId={field.id}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{
        opacity: isDraggingThis ? 0.35 : 1,
        scale: isDraggingThis ? 0.98 : 1,
      }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{
        layout: {
          type: 'spring',
          stiffness: 350,
          damping: 26,
          mass: 0.75,
        },
        opacity: { duration: 0.18 },
        scale: { duration: 0.18 },
      }}
      onClick={(e) => {
        e.stopPropagation()
        selectField(field.id)
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative rounded-xl p-4 cursor-pointer transition-colors duration-150 select-none ${
        isDraggingThis
          ? 'border-dashed border-accent bg-accent-soft '
          : ''
      }`}
      style={{
        gridColumn: `span ${colSpan} / span ${colSpan}`,
        background: isSelected ? 'var(--selected-bg)' : 'var(--surface)',
        border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: isSelected
          ? '0 0 0 3px var(--accent-soft), var(--shadow-accent)'
          : 'var(--shadow-soft)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected && !isDraggingThis) {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.boxShadow = 'var(--shadow-accent)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected && !isDraggingThis) {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.boxShadow = 'var(--shadow-soft)'
        }
      }}
    >
      {/* Animated Drop Indicator Bar */}
      <AnimatePresence>
        {dropIndicator && (
          <>
            {dropIndicator === 'above' && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute left-0 right-0 -top-3.5 z-30 pointer-events-none flex items-center justify-center"
              >
                <div className="absolute inset-x-0 h-1 rounded-full bg-accent shadow-md shadow-accent/40" />
                <span className="relative z-10 px-2 py-0.5 text-[9px] font-bold text-white bg-accent rounded-full shadow tracking-wider uppercase">
                  + Insert Above
                </span>
              </motion.div>
            )}
            {dropIndicator === 'below' && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute left-0 right-0 -bottom-3.5 z-30 pointer-events-none flex items-center justify-center"
              >
                <div className="absolute inset-x-0 h-1 rounded-full bg-accent shadow-md shadow-accent/40" />
                <span className="relative z-10 px-2 py-0.5 text-[9px] font-bold text-white bg-accent rounded-full shadow tracking-wider uppercase">
                  + Insert Below
                </span>
              </motion.div>
            )}
            {dropIndicator === 'left' && (
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                exit={{ scaleY: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute -left-3.5 top-0 bottom-0 z-30 pointer-events-none flex items-center justify-center"
              >
                <div className="absolute inset-y-0 w-1 rounded-full bg-clay shadow-md shadow-clay/40" />
                <span className="relative z-10 px-1.5 py-0.5 text-[8px] font-bold text-white bg-clay rounded-full shadow tracking-wider uppercase whitespace-nowrap -rotate-90">
                  Side by Side
                </span>
              </motion.div>
            )}
            {dropIndicator === 'right' && (
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                exit={{ scaleY: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute -right-3.5 top-0 bottom-0 z-30 pointer-events-none flex items-center justify-center"
              >
                <div className="absolute inset-y-0 w-1 rounded-full bg-clay shadow-md shadow-clay/40" />
                <span className="relative z-10 px-1.5 py-0.5 text-[8px] font-bold text-white bg-clay rounded-full shadow tracking-wider uppercase whitespace-nowrap rotate-90">
                  Side by Side
                </span>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Top bar — type badge, drag handle & actions */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Drag Grip Handle */}
          <motion.div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            title="Drag to change position"
            className="p-1 rounded cursor-grab active:cursor-grabbing hover:bg-accent  text-gray-400 hover:text-accent transition-colors"
          >
            <LuGripVertical size={16} />
          </motion.div>

          {/* Type Badge */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium"
            style={{
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
            }}
          >
            {Icon && <Icon size={12} />}
            <span>{def?.label || field.type}</span>
          </div>

          {/* Width / ColSpan Pill (Clickable Preset Cycle) */}
          <button
            type="button"
            onClick={quickCycleColSpan}
            title="Click to cycle width: 100% -> 50% (side-by-side) -> 33% -> 25%"
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors border cursor-pointer hover:opacity-85"
            style={{
              background: colSpan < 12 ? 'var(--accent-soft)' : 'var(--surface-2)',
              color: colSpan < 12 ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: colSpan < 12 ? 'var(--accent)' : 'var(--border)',
            }}
          >
            <LuColumns2 size={11} />
            <span>{colSpan}/12 ({getPercentageText(colSpan)})</span>
          </button>

          {field.config.required && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{
                background: 'var(--danger-soft)',
                color: 'var(--danger)',
              }}
            >
              Required
            </span>
          )}
        </div>

        {/* Action icons */}
        <div
          className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ opacity: isSelected ? 1 : undefined }}
        >
          {/* Quick width presets */}
          <div className="hidden sm:flex items-center rounded p-0.5 mr-1" style={{ background: 'var(--surface-2)' }}>
            {[
              { span: 6, label: '1/2' },
              { span: 4, label: '1/3' },
              { span: 12, label: 'Full' },
            ].map((p) => (
              <button
                key={p.span}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFieldColSpan(field.id, p.span)
                }}
                title={`Set width to ${p.label}`}
                className={`px-1.5 py-0.5 text-[9px] font-semibold rounded transition-colors cursor-pointer ${
                  colSpan === p.span
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <ActionBtn
            icon={LuChevronUp}
            title="Move up"
            onClick={(e) => {
              e.stopPropagation()
              moveField(field.id, 'up')
            }}
            disabled={index === 0}
          />
          <ActionBtn
            icon={LuChevronDown}
            title="Move down"
            onClick={(e) => {
              e.stopPropagation()
              moveField(field.id, 'down')
            }}
            disabled={index === totalCount - 1}
          />
          <ActionBtn
            icon={LuCopy}
            title="Duplicate"
            onClick={(e) => {
              e.stopPropagation()
              duplicateField(field.id)
            }}
          />
          <ActionBtn
            icon={LuTrash2}
            title="Delete"
            onClick={(e) => {
              e.stopPropagation()
              removeField(field.id)
            }}
            danger
          />
        </div>
      </div>

      {/* Label */}
      {!isContentBlock && !isCheckboxOrToggle && (
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--text-primary)' }}
        >
          {field.config.label}
          {field.config.required && (
            <span style={{ color: 'var(--danger)' }} className="ml-1">*</span>
          )}
        </label>
      )}

      {/* Control representation */}
      <div className="pointer-events-none">
        <FieldRenderer type={field.type} config={field.config} />
      </div>

      {/* Right Edge Interactive Resize Handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        title="Drag right edge to resize width across columns"
        className={`absolute right-0 top-0 bottom-0 w-3 cursor-col-resize rounded-r-xl transition-all duration-150 flex items-center justify-center ${
          isResizing
            ? 'bg-accent shadow-md'
            : 'hover:bg-accent/30 group-hover:bg-accent/25 '
        }`}
      >
        <div className={`w-0.5 rounded-full transition-all ${
          isResizing ? 'h-10 bg-white' : 'h-6 bg-gray-400 group-hover:bg-accent'
        }`} />
      </div>

      {/* Active Resizing Floating Pill */}
      {isResizing && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-8 right-0 bg-accent text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-lg z-40 pointer-events-none"
        >
          {colSpan} / 12 Cols ({getPercentageText(colSpan)})
        </motion.div>
      )}
    </motion.div>
  )
}

function ActionBtn({ icon: Icon, title, onClick, disabled, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-1 rounded-md transition-colors duration-100 disabled:opacity-30 cursor-pointer"
      style={{
        color: danger ? 'var(--danger)' : 'var(--text-muted)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? 'var(--danger-soft)'
          : 'var(--surface-2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <Icon size={14} />
    </button>
  )
}
