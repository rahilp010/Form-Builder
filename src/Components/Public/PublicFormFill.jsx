import { useState } from 'react'
import { useFormStore } from '../../Store/formStore'
import { Button } from '@rahilp010/custom-control'
import { motion } from 'motion/react'
import {
  LuCircleCheck, LuArrowLeft, LuSparkles
} from 'react-icons/lu'
import {
  Input, InputNumber, Textarea, PasswordInput,
  SearchInput, OtpInput, SelectPicker, CheckPicker,
  Checkbox, Radio, RadioGroup, Toggle, DatePicker,
  DateRangePicker, TimePicker, Slider, Rate,
  ColorPicker, Uploader, Divider
} from '@rahilp010/custom-control'

export default function PublicFormFill({ targetFormId }) {
  const formId = targetFormId || useFormStore((s) => s.formId)
  const savedForms = useFormStore((s) => s.savedForms)
  const currentFormTitle = useFormStore((s) => s.formTitle)
  const currentFormDesc = useFormStore((s) => s.formDescription)
  const currentFields = useFormStore((s) => s.fields)
  const submitResponse = useFormStore((s) => s.submitResponse)

  // Use saved form if available, fallback to current in-memory form
  const formRecord = savedForms[formId]
  const title = formRecord?.title || currentFormTitle || 'Untitled Form'
  const description = formRecord?.description || currentFormDesc || ''
  const fields = formRecord?.fields || currentFields || []

  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFieldChange = (fieldId, val) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }))
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[fieldId]
        return next
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate required fields
    const newErrors = {}
    fields.forEach((f) => {
      if (f.config?.required) {
        const val = answers[f.id]
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          newErrors[f.id] = `${f.config.label || 'This field'} is required`
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      submitResponse(formId, answers)
      setIsSubmitting(false)
      setSubmitted(true)
    }, 400)
  }

  const handleReset = () => {
    setAnswers({})
    setErrors({})
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md p-8 rounded-3xl border shadow-xl text-center"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs"
            style={{ background: 'var(--accent-soft)', color: 'var(--success)' }}
          >
            <LuCircleCheck size={36} />
          </div>

          <h2 className="text-2xl font-bold mb-2">
            Response Submitted!
          </h2>
          <p
            className="text-sm mb-8 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Thank you for completing <strong style={{ color: 'var(--text-primary)' }}>{title}</strong>. Your answers have been recorded successfully.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleReset}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-accent hover:bg-accent-hover transition-colors shadow-xs"
            >
              Submit Another Response
            </button>
            <a
              href={`${window.location.origin}${window.location.pathname}`}
              className="block w-full py-2 px-4 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
            >
              Open FormBuilder
            </a>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Top back link if opened from builder */}
        <div className="mb-6 flex justify-between items-center">
          <a
            href={`${window.location.origin}${window.location.pathname}`}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-accent transition-colors"
          >
            <LuArrowLeft size={14} />
            Back to FormBuilder
          </a>
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <LuSparkles size={12} className="text-accent" /> Powered by FormBuilder
          </span>
        </div>

        {/* Card Form container */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl p-8 sm:p-10 border shadow-xl"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {/* Header */}
          <div className="mb-8 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Form Fields */}
          {fields.length > 0 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-12 gap-x-4 gap-y-6 items-start">
                {fields.map((field) => {
                  const cfg = field.config || {}
                  const colSpan = cfg.colSpan || 12
                  const err = errors[field.id]
                  const isCheckboxOrToggle = ['checkbox', 'toggle'].includes(field.type)
                  const isContentBlock = ['heading', 'richtext', 'image', 'divider'].includes(field.type)

                  return (
                    <div
                      key={field.id}
                      style={{
                        gridColumn: `span ${colSpan} / span ${colSpan}`,
                      }}
                      className="w-full"
                    >
                      {!isContentBlock && !isCheckboxOrToggle && (
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                          {cfg.label}
                          {cfg.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                      )}

                      {/* Interactive Control */}
                      <LiveControlRenderer
                        field={field}
                        value={answers[field.id]}
                        onChange={(val) => handleFieldChange(field.id, val)}
                      />

                      {err && (
                        <p className="text-xs text-red-500 mt-1 font-medium">
                          {err}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="pt-6 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                >
                  Submit Form
                </Button>
                <p className="text-[11px] text-gray-400">
                  Responses are securely recorded
                </p>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-sm text-gray-400">
              This form does not contain any fields yet.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

/**
 * Live interactive control renderer for public form responses
 */
function LiveControlRenderer({ field, value, onChange }) {
  const cfg = field.config || {}

  switch (field.type) {
    case 'input':
    case 'email':
      return (
        <Input
          value={value || ''}
          onChange={(val) => onChange(val)}
          placeholder={cfg.placeholder}
          clearable={cfg.clearable}
          size={cfg.size}
          type={field.type === 'email' ? 'email' : 'text'}
        />
      )

    case 'textarea':
      return (
        <Textarea
          value={value || ''}
          onChange={(val) => onChange(val)}
          placeholder={cfg.placeholder}
          rows={cfg.rows || 4}
          maxLength={cfg.maxLength}
          showCount={cfg.showCount}
        />
      )

    case 'number':
      return (
        <InputNumber
          value={value}
          onChange={(val) => onChange(val)}
          placeholder={cfg.placeholder}
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          size={cfg.size}
        />
      )

    case 'password':
      return (
        <PasswordInput
          value={value || ''}
          onChange={(val) => onChange(val)}
          placeholder={cfg.placeholder}
          showToggle={cfg.showToggle}
          size={cfg.size}
        />
      )

    case 'search':
      return (
        <SearchInput
          value={value || ''}
          onChange={(val) => onChange(val)}
          placeholder={cfg.placeholder}
          cleanable={cfg.cleanable}
          size={cfg.size}
        />
      )

    case 'otp':
      return (
        <OtpInput
          length={cfg.length || 6}
          type={cfg.otpType || 'numeric'}
          onChange={(code) => onChange(code)}
        />
      )

    case 'select':
      return (
        <SelectPicker
          value={value}
          onChange={(val) => onChange(val)}
          data={cfg.options || []}
          placeholder={cfg.placeholder}
          searchable={cfg.searchable}
          cleanable={cfg.cleanable}
          size={cfg.size}
        />
      )

    case 'checkpicker':
      return (
        <CheckPicker
          value={value || []}
          onChange={(vals) => onChange(vals)}
          data={cfg.options || []}
          placeholder={cfg.placeholder}
          searchable={cfg.searchable}
          tagDisplay={cfg.tagDisplay}
          size={cfg.size}
        />
      )

    case 'checkbox':
      return (
        <Checkbox
          checked={!!value}
          onChange={(chk) => onChange(chk)}
        >
          {cfg.label}
        </Checkbox>
      )

    case 'radio':
      return (
        <RadioGroup
          value={value}
          onChange={(val) => onChange(val)}
          direction={cfg.direction}
        >
          {(cfg.options || []).map((opt) => (
            <Radio key={opt.value} value={opt.value}>
              {opt.label}
            </Radio>
          ))}
        </RadioGroup>
      )

    case 'toggle':
      return (
        <div className="flex items-center gap-3">
          <Toggle
            checked={!!value}
            onChange={(v) => onChange(v)}
            size={cfg.size}
            checkedChildren={cfg.checkedChildren}
            unCheckedChildren={cfg.unCheckedChildren}
          />
          <span className="text-sm font-medium">{cfg.label}</span>
        </div>
      )

    case 'datepicker':
      return (
        <DatePicker
          value={value}
          onChange={(dateStr) => onChange(dateStr)}
          placeholder={cfg.placeholder}
          cleanable={cfg.cleanable}
          format={cfg.format}
          size={cfg.size}
        />
      )

    case 'daterange':
      return (
        <DateRangePicker
          value={value}
          onChange={(range) => onChange(range)}
          placeholder={cfg.placeholder}
          size={cfg.size}
        />
      )

    case 'timepicker':
      return (
        <TimePicker
          value={value}
          onChange={(time24) => onChange(time24)}
          placeholder={cfg.placeholder}
          cleanable={cfg.cleanable}
          is12h={cfg.is12h}
          size={cfg.size}
        />
      )

    case 'slider':
      return (
        <Slider
          defaultValue={value || 50}
          onChange={(e) => onChange(Number(e.target.value))}
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          showValue={cfg.showValue}
        />
      )

    case 'rate':
      return (
        <Rate
          value={value || 0}
          onChange={(val) => onChange(val)}
          max={cfg.max || 5}
          allowHalf={cfg.allowHalf}
          size={cfg.size}
        />
      )

    case 'colorpicker':
      return (
        <ColorPicker
          value={value || '#2f5d46'}
          onChange={(hex) => onChange(hex)}
          showValue={cfg.showValue}
        />
      )

    case 'uploader':
      return (
        <Uploader
          draggable={cfg.draggable}
          accept={cfg.accept}
          onChange={(files) => onChange(files.map((f) => f.name).join(', '))}
        >
          <div className="py-6 px-4 text-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-accent transition-colors">
            <p className="text-sm font-medium">Click to select files or drop here</p>
          </div>
        </Uploader>
      )

    case 'heading': {
      const alignClass = cfg.align === 'center' ? 'text-center' : cfg.align === 'right' ? 'text-right' : 'text-left'
      return (
        <div className={`py-1 ${alignClass}`}>
          <h3 className="text-xl font-bold leading-tight">
            {cfg.label || 'Heading'}
          </h3>
          {cfg.subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {cfg.subtitle}
            </p>
          )}
        </div>
      )
    }

    case 'richtext':
      return (
        <div
          className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none p-1"
          dangerouslySetInnerHTML={{ __html: cfg.content || '<p>Empty text block</p>' }}
        />
      )

    case 'image': {
      const alignClass = cfg.align === 'center' ? 'mx-auto' : cfg.align === 'right' ? 'ml-auto' : 'mr-auto'
      const roundedClass = cfg.rounded === 'none' ? 'rounded-none' : cfg.rounded === 'full' ? 'rounded-full' : cfg.rounded === 'sm' ? 'rounded-sm' : 'rounded-xl'
      return (
        <div className="w-full text-center">
          <img
            src={cfg.src || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80'}
            alt={cfg.alt || 'Banner'}
            style={{ maxHeight: `${cfg.maxHeight || 220}px` }}
            className={`w-full object-cover ${roundedClass} ${alignClass} border shadow-xs`}
          />
          {cfg.caption && (
            <p className="text-[11px] mt-1.5 italic text-gray-400">
              {cfg.caption}
            </p>
          )}
        </div>
      )
    }

    case 'divider':
      return (
        <Divider direction={cfg.direction} dashed={cfg.dashed}>
          {cfg.label}
        </Divider>
      )

    default:
      return null
  }
}
