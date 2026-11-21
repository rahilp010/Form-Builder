import { useState } from 'react'
import { useFormStore } from '../../Store/formStore'
import CanvasField from './CanvasField'
import { motion, AnimatePresence } from 'motion/react'
import { LuMousePointerClick, LuPlus, LuLayoutGrid } from 'react-icons/lu'

export default function Canvas() {
  const fields = useFormStore((s) => s.fields)
  const addField = useFormStore((s) => s.addField)
  const moveFieldToEnd = useFormStore((s) => s.moveFieldToEnd)
  const clearSelection = useFormStore((s) => s.clearSelection)
  const isDragging = useFormStore((s) => s.isDragging)
  const setDragState = useFormStore((s) => s.setDragState)
  const formTitle = useFormStore((s) => s.formTitle)
  const setFormTitle = useFormStore((s) => s.setFormTitle)
  const formDescription = useFormStore((s) => s.formDescription)
  const setFormDescription = useFormStore((s) => s.setFormDescription)
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false)
  const [isOverBottomZone, setIsOverBottomZone] = useState(false)

  const handleCanvasDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    if (!isDragOverCanvas) setIsDragOverCanvas(true)
  }

  const handleCanvasDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOverCanvas(false)
    }
  }

  const handleCanvasDrop = (e) => {
    e.preventDefault()
    setIsDragOverCanvas(false)
    setIsOverBottomZone(false)

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
      addField(data.type)
    } else if (data.source === 'canvas') {
      const movedId =
        data.id || (data.index !== undefined ? fields[data.index]?.id : null)
      if (movedId) {
        moveFieldToEnd(movedId)
      }
    }
  }

  return (
    <main
      className="flex-1 overflow-y-auto relative"
      style={{ background: 'var(--bg)' }}
      onClick={clearSelection}
      onDragOver={handleCanvasDragOver}
      onDragLeave={handleCanvasDragLeave}
      onDrop={handleCanvasDrop}
    >
      <div className="max-w-4xl mx-auto py-8 px-6 relative">
        {/* Form header — Editable Form Name & Description */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="mb-8 p-5 rounded-2xl border transition-all"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Click to name your form (e.g. Job Application, Survey)..."
                className="text-2xl font-bold w-full bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-accent pb-1 transition-colors"
                style={{ color: 'var(--text-primary)' }}
              />
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Add an optional description or instructions for respondents..."
                className="text-xs w-full bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-accent pt-1 pb-0.5 text-gray-500 dark:text-gray-400 transition-colors"
              />
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-all ${
                isDragging
                  ? 'ring-2 ring-accent bg-accent-soft  text-accent'
                  : ''
              }`}
              style={{
                background: isDragging ? undefined : 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: isDragging ? undefined : 'var(--text-secondary)',
              }}
            >
              <LuLayoutGrid size={13} style={{ color: 'var(--accent)' }} />
              <span>12-Column Grid</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
            <span>💡</span>
            <span>Click to customize form title & instructions • Drag controls to reorder • Drag right edge to resize</span>
          </p>
        </motion.div>

        {/* 12-Column Fields Grid Container */}
        <div className="relative">
          {/* Subtle 12-column blueprint background when dragging */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 pointer-events-none grid grid-cols-12 gap-4 px-2 -z-0"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full rounded-xl border border-dashed border-accent/20 bg-accent/[0.03]"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {fields.length > 0 ? (
            <motion.div
              layout
              className={`grid grid-cols-12 gap-4 items-start rounded-2xl p-2 transition-all relative z-10 ${
                isDragOverCanvas
                  ? 'ring-2 ring-accent ring-dashed bg-accent-soft '
                  : ''
              }`}
            >
              <AnimatePresence mode="popLayout">
                {fields.map((field, idx) => (
                  <CanvasField
                    key={field.id}
                    field={field}
                    index={idx}
                    totalCount={fields.length}
                  />
                ))}
              </AnimatePresence>

              {/* Bottom Drop Zone — Unrestricted drop to append below all controls */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.dataTransfer.dropEffect = 'copy'
                  if (!isOverBottomZone) setIsOverBottomZone(true)
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setIsOverBottomZone(false)
                  }
                }}
                onDrop={(e) => {
                  e.stopPropagation()
                  handleCanvasDrop(e)
                }}
                className={`col-span-12 mt-3 py-6 px-4 rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer select-none ${
                  isOverBottomZone
                    ? 'border-accent bg-accent-soft  scale-[1.01] shadow-lg shadow-accent/15'
                    : isDragging
                    ? 'border-accent/70 bg-accent-soft  animate-pulse'
                    : 'border-gray-200 dark:border-neutral-800 hover:border-accent/50 bg-transparent'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-accent ">
                  <LuPlus size={16} />
                  <span>Drop control here to add below all controls</span>
                </div>
                <p className="text-[11px] text-gray-400 dark:text-neutral-500">
                  Drag anywhere above, below, or next to any existing control
                </p>
              </div>
            </motion.div>
          ) : (
            <EmptyState isDragOver={isDragOverCanvas} />
          )}
        </div>
      </div>
    </main>
  )
}

function EmptyState({ isDragOver }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className={`flex flex-col items-center justify-center py-28 text-center rounded-2xl transition-all border-2 border-dashed ${
        isDragOver
          ? 'border-accent bg-accent-soft  scale-[1.01]'
          : 'border-transparent'
      }`}
    >
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
        }}
      >
        <LuMousePointerClick size={28} />
      </motion.div>

      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {isDragOver ? 'Drop control here!' : 'Start building your form'}
      </h3>
      <p
        className="text-sm max-w-sm mb-6"
        style={{ color: 'var(--text-muted)' }}
      >
        Click or drag any control from the sidebar. You can place fields side-by-side,
        drag to reorder positions, and resize any field width seamlessly.
      </p>

      <div
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
        style={{
          background: 'var(--surface)',
          border: '1px dashed var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <LuPlus size={14} />
        Drag from sidebar or click to add
      </div>
    </motion.div>
  )
}
