import { useState } from 'react'
import { useFormStore } from '../../Store/formStore'
import { exportFormToPdf } from '../../utils/exportPdf'
import { Button } from '@rahilp010/custom-control'
import { motion, AnimatePresence } from 'motion/react'
import {
  LuArrowLeft, LuDownload, LuCode, LuFileDown,
  LuCircleCheck, LuInbox, LuEye
} from 'react-icons/lu'
import {
  Input, InputNumber, Textarea, PasswordInput,
  SearchInput, OtpInput, SelectPicker, CheckPicker,
  Checkbox, Radio, RadioGroup, Toggle, DatePicker,
  DateRangePicker, TimePicker, Slider, Rate,
  ColorPicker, Uploader, Divider
} from '@rahilp010/custom-control'

export default function FormPreview() {
  const formId = useFormStore((s) => s.formId)
  const formTitle = useFormStore((s) => s.formTitle)
  const formDescription = useFormStore((s) => s.formDescription)
  const fields = useFormStore((s) => s.fields)
  const setActiveView = useFormStore((s) => s.setActiveView)
  const exportJSON = useFormStore((s) => s.exportJSON)
  const submitResponse = useFormStore((s) => s.submitResponse)
  const responses = useFormStore((s) => s.responses)

  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const responseCount = (responses[formId] || []).length

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

    // Required fields check
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
    }, 300)
  }

  const handleExportPdf = () => {
    exportFormToPdf({
      title: formTitle,
      description: formDescription,
      fields,
    })
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
            startIcon={<LuFileDown size={14} />}
            onClick={handleExportPdf}
          >
            Download PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            startIcon={<LuCode size={14} />}
            onClick={() => navigator.clipboard.writeText(exportJSON())}
          >
            Copy JSON
          </Button>

          <Button
            variant="outline"
            size="sm"
            startIcon={<LuInbox size={14} />}
            onClick={() => setActiveView('responses')}
          >
            Responses ({responseCount})
          </Button>
        </div>
      </div>

      {/* Preview form container */}
      <div className="max-w-3xl mx-auto py-10 px-6">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-3xl p-8 text-center border shadow-xl"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--success)',
                }}
              >
                <LuCircleCheck size={36} />
              </div>
              <h3 className="text-xl font-bold mb-2">Test Response Recorded!</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                Your test submission was saved to this form's responses. You can view all responses in the Responses tab.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  startIcon={<LuInbox size={14} />}
                  onClick={() => setActiveView('responses')}
                >
                  View in Responses
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAnswers({})
                    setSubmitted(false)
                  }}
                >
                  Submit Another
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl p-8 sm:p-10 border shadow-xl"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="mb-8 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent  bg-accent-soft  px-2 py-0.5 rounded-md mb-2 inline-block">
                  Live Interactive Preview
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-2">
                  {formTitle || 'Untitled Form'}
                </h2>
                {formDescription && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formDescription}
                  </p>
                )}
              </div>

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
                            <label className="block text-sm font-semibold mb-1.5">
                              {cfg.label}
                              {cfg.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                          )}

                          <PreviewControlRenderer
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
                      size="md"
                      loading={isSubmitting}
                    >
                      Submit Response
                    </Button>
                    <p className="text-[11px] text-gray-400">
                      Submitting saves a live response to your form
                    </p>
                  </div>
                </form>
              ) : (
                <div className="text-center py-16 text-sm text-gray-400">
                  No fields added yet. Go back to the editor to add form controls.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function PreviewControlRenderer({ field, value, onChange }) {
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
          <h3 className="text-xl font-bold leading-tight text-gray-900 dark:text-gray-100">
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
