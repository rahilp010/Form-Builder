import { useState, useRef } from 'react'
import { useFormStore } from '../../Store/formStore'
import { FIELD_REGISTRY } from '../../data/fieldDefinitions'
import { Input, InputNumber, Toggle, SelectPicker, Button } from '@rahilp010/custom-control'
import { motion, AnimatePresence } from 'motion/react'
import {
  LuX, LuSettings2, LuPaintbrush, LuListChecks,
  LuPlus, LuTrash2, LuChevronDown, LuBold, LuItalic,
  LuUnderline, LuStrikethrough, LuList, LuListOrdered,
  LuAlignLeft, LuAlignCenter, LuAlignRight, LuQuote,
  LuLink, LuUpload, LuImage, LuHeading, LuLetterText
} from 'react-icons/lu'

export default function PropertiesPanel() {
  const selectedFieldId = useFormStore((s) => s.selectedFieldId)
  const fields = useFormStore((s) => s.fields)
  const updateFieldConfig = useFormStore((s) => s.updateFieldConfig)
  const removeField = useFormStore((s) => s.removeField)
  const clearSelection = useFormStore((s) => s.clearSelection)

  const field = fields.find((f) => f.id === selectedFieldId)
  if (!field) return null

  const def = FIELD_REGISTRY[field.type]
  const Icon = def?.icon
  const config = field.config

  const update = (key, val) => updateFieldConfig(field.id, { [key]: val })

  const [activeTab, setActiveTab] = useState('general')

  return (
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="shrink-0 flex flex-col border-l overflow-hidden"
      style={{
        width: 'var(--properties-w)',
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <Icon size={14} />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {def?.label}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Properties
            </p>
          </div>
        </div>
        <button
          onClick={clearSelection}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <LuX size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex border-b px-4 gap-1 pt-1"
        style={{ borderColor: 'var(--border)' }}
      >
        {[
          { id: 'general', label: 'General', icon: LuSettings2 },
          { id: 'options', label: 'Options', icon: LuListChecks },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-200 border-b-2"
            style={{
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
              borderColor: activeTab === tab.id ? 'var(--accent)' : 'transparent',
            }}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Properties body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <AnimatePresence mode="wait">
          {activeTab === 'general' ? (
            <motion.div
              key="general"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <GeneralProperties config={config} update={update} type={field.type} />
            </motion.div>
          ) : (
            <motion.div
              key="options"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <OptionsProperties config={config} update={update} type={field.type} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer — Delete */}
      <div
        className="p-4 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <Button
          variant="danger"
          size="sm"
          startIcon={<LuTrash2 size={14} />}
          onClick={() => removeField(field.id)}
          className="w-full"
        >
          Delete Field
        </Button>
      </div>
    </motion.aside>
  )
}

/* ─── General Properties ─── */
function GeneralProperties({ config, update, type }) {
  const noLabel = ['divider', 'richtext'].includes(type)
  const hasPlaceholder = ['input', 'email', 'textarea', 'number', 'password', 'search', 'select', 'checkpicker', 'datepicker', 'daterange', 'timepicker'].includes(type)
  const hasRequired = !['divider', 'toggle', 'checkbox', 'heading', 'richtext', 'image'].includes(type)
  const hasDisabled = !['divider', 'heading', 'richtext', 'image'].includes(type)
  const hasSize = ['input', 'email', 'number', 'password', 'search', 'select', 'checkpicker', 'datepicker', 'daterange', 'timepicker', 'toggle', 'rate'].includes(type)

  return (
    <>
      {!noLabel && (
        <PropGroup label={type === 'heading' ? 'Heading Title' : type === 'image' ? 'Image Label' : 'Label'}>
          <Input
            value={config.label || ''}
            onChange={(val) => update('label', val)}
            placeholder="Field label"
            size="sm"
          />
        </PropGroup>
      )}

      {hasPlaceholder && (
        <PropGroup label="Placeholder">
          <Input
            value={config.placeholder || ''}
            onChange={(val) => update('placeholder', val)}
            placeholder="Placeholder text"
            size="sm"
          />
        </PropGroup>
      )}

      {/* Control Width & Grid Columns for Side by Side */}
      <PropGroup label="Control Width (Grid Columns)">
        <div className="space-y-2">
          {/* Presets */}
          <div className="grid grid-cols-4 gap-1">
            {[
              { span: 12, label: '100% Full' },
              { span: 6, label: '50% (1/2)' },
              { span: 4, label: '33% (1/3)' },
              { span: 3, label: '25% (1/4)' },
            ].map((preset) => {
              const currentSpan = config.colSpan || 12
              const active = currentSpan === preset.span
              return (
                <button
                  key={preset.span}
                  type="button"
                  onClick={() => update('colSpan', preset.span)}
                  className="py-1.5 px-1 rounded-md text-[11px] font-medium transition-all text-center cursor-pointer"
                  style={{
                    background: active ? 'var(--accent)' : 'var(--surface-2)',
                    color: active ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>

          {/* Range Slider */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={config.colSpan || 12}
              onChange={(e) => update('colSpan', Number(e.target.value))}
              className="flex-1 accent-[var(--accent)] cursor-pointer h-1.5 rounded-lg bg-gray-200 dark:bg-gray-700"
            />
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded shrink-0 border"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              {config.colSpan || 12}/12
            </span>
          </div>

          <p className="text-[10px] leading-normal" style={{ color: 'var(--text-muted)' }}>
            💡 Combine 6 + 6 columns or 4 + 4 + 4 to place controls side-by-side. You can also drag the right edge of any control on the canvas to resize it interactively!
          </p>
        </div>
      </PropGroup>

      {hasSize && (
        <PropGroup label="Size">
          <div className="flex gap-1">
            {['sm', 'md', 'lg'].map((s) => (
              <button
                key={s}
                onClick={() => update('size', s)}
                className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                style={{
                  background: config.size === s ? 'var(--accent)' : 'var(--surface-2)',
                  color: config.size === s ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${config.size === s ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </PropGroup>
      )}

      {hasRequired && (
        <PropRow label="Required">
          <Toggle
            checked={!!config.required}
            onChange={(v) => update('required', v)}
            size="md"
          />
        </PropRow>
      )}

      {hasDisabled && (
        <PropRow label="Disabled">
          <Toggle
            checked={!!config.disabled}
            onChange={(v) => update('disabled', v)}
            size="md"
          />
        </PropRow>
      )}

      {/* Type-specific */}
      {type === 'textarea' && (
        <>
          <PropGroup label="Rows">
            <InputNumber
              value={config.rows}
              onChange={(v) => update('rows', v || 4)}
              min={1}
              max={20}
              size="sm"
            />
          </PropGroup>
          <PropGroup label="Max Length">
            <InputNumber
              value={config.maxLength}
              onChange={(v) => update('maxLength', v || undefined)}
              min={0}
              size="sm"
            />
          </PropGroup>
          <PropRow label="Show Count">
            <Toggle
              checked={!!config.showCount}
              onChange={(v) => update('showCount', v)}
              size="md"
            />
          </PropRow>
        </>
      )}

      {type === 'number' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <PropGroup label="Min">
              <InputNumber
                value={config.min}
                onChange={(v) => update('min', v === '' ? undefined : v)}
                size="sm"
              />
            </PropGroup>
            <PropGroup label="Max">
              <InputNumber
                value={config.max}
                onChange={(v) => update('max', v === '' ? undefined : v)}
                size="sm"
              />
            </PropGroup>
          </div>
          <PropGroup label="Step">
            <InputNumber
              value={config.step}
              onChange={(v) => update('step', v || 1)}
              min={0.01}
              size="sm"
            />
          </PropGroup>
        </>
      )}

      {(type === 'input' || type === 'email') && (
        <PropRow label="Clearable">
          <Toggle
            checked={!!config.clearable}
            onChange={(v) => update('clearable', v)}
            size="md"
          />
        </PropRow>
      )}

      {type === 'password' && (
        <PropRow label="Show Toggle">
          <Toggle
            checked={!!config.showToggle}
            onChange={(v) => update('showToggle', v)}
            size="md"
          />
        </PropRow>
      )}

      {type === 'otp' && (
        <PropGroup label="Code Length">
          <InputNumber
            value={config.length}
            onChange={(v) => update('length', v || 6)}
            min={4}
            max={8}
            size="sm"
          />
        </PropGroup>
      )}

      {type === 'slider' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <PropGroup label="Min">
              <InputNumber
                value={config.min}
                onChange={(v) => update('min', v === '' ? 0 : v)}
                size="sm"
              />
            </PropGroup>
            <PropGroup label="Max">
              <InputNumber
                value={config.max}
                onChange={(v) => update('max', v === '' ? 100 : v)}
                size="sm"
              />
            </PropGroup>
          </div>
          <PropRow label="Show Value">
            <Toggle
              checked={!!config.showValue}
              onChange={(v) => update('showValue', v)}
              size="md"
            />
          </PropRow>
        </>
      )}

      {type === 'rate' && (
        <>
          <PropGroup label="Max Stars">
            <InputNumber
              value={config.max}
              onChange={(v) => update('max', v || 5)}
              min={1}
              max={10}
              size="sm"
            />
          </PropGroup>
          <PropRow label="Allow Half">
            <Toggle
              checked={!!config.allowHalf}
              onChange={(v) => update('allowHalf', v)}
              size="md"
            />
          </PropRow>
        </>
      )}

      {type === 'timepicker' && (
        <PropRow label="12-Hour Format">
          <Toggle
            checked={!!config.is12h}
            onChange={(v) => update('is12h', v)}
            size="md"
          />
        </PropRow>
      )}

      {type === 'divider' && (
        <PropRow label="Dashed">
          <Toggle
            checked={!!config.dashed}
            onChange={(v) => update('dashed', v)}
            size="md"
          />
        </PropRow>
      )}

      {/* Section Heading Specific */}
      {type === 'heading' && (
        <>
          <PropGroup label="Subtitle / Guidance">
            <Input
              value={config.subtitle || ''}
              onChange={(val) => update('subtitle', val)}
              placeholder="Section guidance or context"
              size="sm"
            />
          </PropGroup>
          <PropGroup label="Text Alignment">
            <div className="flex gap-1">
              {[
                { id: 'left', icon: LuAlignLeft, label: 'Left' },
                { id: 'center', icon: LuAlignCenter, label: 'Center' },
                { id: 'right', icon: LuAlignRight, label: 'Right' },
              ].map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => update('align', a.id)}
                  className={`flex-1 py-1.5 flex items-center justify-center gap-1 rounded-md text-xs font-medium border cursor-pointer ${
                    (config.align || 'left') === a.id
                      ? 'bg-accent text-white border-accent'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <a.icon size={13} />
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </PropGroup>
        </>
      )}

      {/* Rich Text Editor */}
      {type === 'richtext' && (
        <PropGroup label="Rich Text Content & Formatting">
          <RichTextToolbarEditor
            content={config.content || ''}
            onChange={(html) => update('content', html)}
          />
        </PropGroup>
      )}

      {/* Image Banner Properties */}
      {type === 'image' && (
        <ImagePropertiesEditor config={config} update={update} />
      )}
    </>
  )
}

/* ─── Options Properties ─── */
function OptionsProperties({ config, update, type }) {
  const hasOptions = ['select', 'checkpicker', 'radio'].includes(type)

  if (!hasOptions) {
    return (
      <div
        className="flex flex-col items-center py-12 text-center"
      >
        <LuListChecks size={24} style={{ color: 'var(--text-muted)' }} className="mb-3" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          This field type doesn't have options to configure.
        </p>
      </div>
    )
  }

  const options = config.options || []

  const addOption = () => {
    const newOpt = {
      label: `Option ${options.length + 1}`,
      value: `opt${options.length + 1}`,
    }
    update('options', [...options, newOpt])
  }

  const removeOption = (idx) => {
    update('options', options.filter((_, i) => i !== idx))
  }

  const updateOption = (idx, key, val) => {
    const updated = options.map((opt, i) =>
      i === idx ? { ...opt, [key]: val } : opt
    )
    update('options', updated)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Options ({options.length})
        </p>
        <button
          onClick={addOption}
          className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition-colors"
          style={{ color: 'var(--accent)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-soft)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <LuPlus size={12} />
          Add
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {options.map((opt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Input
                value={opt.label}
                onChange={(val) => updateOption(idx, 'label', val)}
                size="sm"
                placeholder="Label"
                className="flex-1"
              />
              <Input
                value={opt.value}
                onChange={(val) => updateOption(idx, 'value', val)}
                size="sm"
                placeholder="Value"
                className="flex-1"
              />
              <button
                onClick={() => removeOption(idx)}
                className="p-1 rounded-md shrink-0 transition-colors"
                style={{ color: 'var(--danger)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--danger-soft)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LuTrash2 size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {type === 'select' && (
        <>
          <PropRow label="Searchable">
            <Toggle
              checked={!!config.searchable}
              onChange={(v) => update('searchable', v)}
              size="md"
            />
          </PropRow>
          <PropRow label="Clearable">
            <Toggle
              checked={!!config.cleanable}
              onChange={(v) => update('cleanable', v)}
              size="md"
            />
          </PropRow>
        </>
      )}

      {type === 'checkpicker' && (
        <>
          <PropRow label="Searchable">
            <Toggle
              checked={!!config.searchable}
              onChange={(v) => update('searchable', v)}
              size="md"
            />
          </PropRow>
          <PropRow label="Tag Display">
            <Toggle
              checked={!!config.tagDisplay}
              onChange={(v) => update('tagDisplay', v)}
              size="md"
            />
          </PropRow>
        </>
      )}

      {type === 'radio' && (
        <PropGroup label="Direction">
          <div className="flex gap-1">
            {['vertical', 'horizontal'].map((d) => (
              <button
                key={d}
                onClick={() => update('direction', d)}
                className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-150 capitalize"
                style={{
                  background: config.direction === d ? 'var(--accent)' : 'var(--surface-2)',
                  color: config.direction === d ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${config.direction === d ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </PropGroup>
      )}
    </>
  )
}

/* ─── Reusable property row components ─── */

function PropGroup({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function PropRow({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

/* ─── Rich Text Toolbar & Content Editor ─── */
function RichTextToolbarEditor({ content, onChange }) {
  const [viewMode, setViewMode] = useState('visual') // 'visual' | 'html'
  const textareaRef = useRef(null)

  const insertTag = (openTag, closeTag = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const replacement = `${openTag}${selectedText || 'Text'}${closeTag}`
    const newContent = content.substring(0, start) + replacement + content.substring(end)

    onChange(newContent)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + (selectedText.length || 4))
    }, 50)
  }

  return (
    <div className="space-y-2 border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      {/* Formatting Toolbar */}
      <div
        className="flex flex-wrap items-center gap-1 p-1.5 border-b"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
      >
        <button
          type="button"
          onClick={() => insertTag('<strong>', '</strong>')}
          title="Bold"
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <LuBold size={13} />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<em>', '</em>')}
          title="Italic"
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <LuItalic size={13} />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<u>', '</u>')}
          title="Underline"
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <LuUnderline size={13} />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<s>', '</s>')}
          title="Strikethrough"
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <LuStrikethrough size={13} />
        </button>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-0.5" />

        <button
          type="button"
          onClick={() => insertTag('<h3>', '</h3>')}
          title="Heading 3"
          className="px-1.5 py-0.5 text-[10px] font-bold rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => insertTag('<p>', '</p>')}
          title="Paragraph"
          className="px-1.5 py-0.5 text-[10px] font-bold rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          P
        </button>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-0.5" />

        <button
          type="button"
          onClick={() => insertTag('<ul>\n  <li>', '</li>\n  <li>Second item</li>\n</ul>')}
          title="Bullet List"
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <LuList size={13} />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<ol>\n  <li>', '</li>\n  <li>Second step</li>\n</ol>')}
          title="Numbered List"
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <LuListOrdered size={13} />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<blockquote className="pl-3 border-l-2 border-accent italic text-gray-600">', '</blockquote>')}
          title="Blockquote"
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <LuQuote size={13} />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<a href="https://" target="_blank" className="text-accent underline">', '</a>')}
          title="Insert Link"
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <LuLink size={13} />
        </button>
      </div>

      {/* Editor Textarea */}
      <div className="p-2">
        <textarea
          ref={textareaRef}
          rows={5}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type or format your instructions..."
          className="w-full text-xs font-mono outline-none bg-transparent resize-y"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Live Formatted Preview */}
      <div
        className="p-3 border-t text-xs leading-relaxed"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
          Live Render Preview:
        </p>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: content || '<p className="text-gray-400 italic">Empty text block</p>' }}
        />
      </div>
    </div>
  )
}

/* ─── Image Banner Properties Editor ─── */
function ImagePropertiesEditor({ config, update }) {
  const fileInputRef = useRef(null)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      if (typeof dataUrl === 'string') {
        update('src', dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      <PropGroup label="Image Source">
        <div className="space-y-2">
          <Input
            value={config.src || ''}
            onChange={(val) => update('src', val)}
            placeholder="Image URL (https://...)"
            size="sm"
          />
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:border-accent text-gray-700 dark:text-gray-300 transition-colors w-full justify-center"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
            >
              <LuUpload size={13} />
              Upload Local Image
            </button>
          </div>
        </div>
      </PropGroup>

      <PropGroup label="Alt Text (Accessibility)">
        <Input
          value={config.alt || ''}
          onChange={(val) => update('alt', val)}
          placeholder="Description of the image"
          size="sm"
        />
      </PropGroup>

      <PropGroup label="Caption (Optional)">
        <Input
          value={config.caption || ''}
          onChange={(val) => update('caption', val)}
          placeholder="Caption text below image"
          size="sm"
        />
      </PropGroup>

      <PropGroup label={`Max Height: ${config.maxHeight || 220}px`}>
        <input
          type="range"
          min={100}
          max={500}
          step={20}
          value={config.maxHeight || 220}
          onChange={(e) => update('maxHeight', Number(e.target.value))}
          className="w-full accent-[var(--accent)] cursor-pointer h-1.5 rounded-lg bg-gray-200 dark:bg-gray-700"
        />
      </PropGroup>

      <PropGroup label="Corner Rounding">
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'none', label: 'Square' },
            { id: 'sm', label: 'Small' },
            { id: 'lg', label: 'Large' },
            { id: 'full', label: 'Pill' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => update('rounded', r.id)}
              className={`py-1 rounded text-xs font-medium border ${
                (config.rounded || 'lg') === r.id
                  ? 'bg-accent text-white border-accent'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </PropGroup>

      <PropGroup label="Image Alignment">
        <div className="flex gap-1">
          {[
            { id: 'left', icon: LuAlignLeft, label: 'Left' },
            { id: 'center', icon: LuAlignCenter, label: 'Center' },
            { id: 'right', icon: LuAlignRight, label: 'Right' },
          ].map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => update('align', a.id)}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1 rounded-md text-xs font-medium border cursor-pointer ${
                (config.align || 'center') === a.id
                  ? 'bg-accent text-white border-accent'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <a.icon size={13} />
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </PropGroup>
    </div>
  )
}
