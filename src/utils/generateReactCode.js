/**
 * Generates production-ready React JSX code using @rahilp010/custom-control
 */
export function generateReactCode({ title, description, fields }) {
  // Collect all unique component imports needed
  const componentImports = new Set(['Button'])

  fields.forEach((f) => {
    switch (f.type) {
      case 'input':
      case 'email':
        componentImports.add('Input')
        break
      case 'textarea':
        componentImports.add('Textarea')
        break
      case 'number':
        componentImports.add('InputNumber')
        break
      case 'password':
        componentImports.add('PasswordInput')
        break
      case 'search':
        componentImports.add('SearchInput')
        break
      case 'otp':
        componentImports.add('OtpInput')
        break
      case 'select':
        componentImports.add('SelectPicker')
        break
      case 'checkpicker':
        componentImports.add('CheckPicker')
        break
      case 'checkbox':
        componentImports.add('Checkbox')
        break
      case 'radio':
        componentImports.add('Radio')
        componentImports.add('RadioGroup')
        break
      case 'toggle':
        componentImports.add('Toggle')
        break
      case 'datepicker':
        componentImports.add('DatePicker')
        break
      case 'daterange':
        componentImports.add('DateRangePicker')
        break
      case 'timepicker':
        componentImports.add('TimePicker')
        break
      case 'slider':
        componentImports.add('Slider')
        break
      case 'rate':
        componentImports.add('Rate')
        break
      case 'colorpicker':
        componentImports.add('ColorPicker')
        break
      case 'uploader':
        componentImports.add('Uploader')
        break
      case 'divider':
        componentImports.add('Divider')
        break
      default:
        break
    }
  })

  const importList = Array.from(componentImports).sort().join(', ')
  const componentName = (title || 'CustomForm')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') || 'CustomForm'

  const fieldsJsx = fields
    .map((field) => {
      const cfg = field.config || {}
      const colSpan = cfg.colSpan || 12
      const spanClass = `col-span-12 sm:col-span-${colSpan}`
      const reqMarker = cfg.required ? ` <span className="text-red-500">*</span>` : ''

      if (field.type === 'heading') {
        const alignClass = cfg.align === 'center' ? 'text-center' : cfg.align === 'right' ? 'text-right' : 'text-left'
        return `        {/* Section Heading */}
        <div className="${spanClass} ${alignClass} pt-2">
          <h3 className="text-xl font-bold text-gray-900">${cfg.label || 'Heading'}</h3>
          ${cfg.subtitle ? `<p className="text-xs text-gray-500 mt-0.5">${cfg.subtitle}</p>` : ''}
        </div>`
      }

      if (field.type === 'richtext') {
        return `        {/* Rich Text Block */}
        <div className="${spanClass} prose prose-sm text-gray-700 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: \`${(cfg.content || '').replace(/`/g, '\\`')}\` }} />
        </div>`
      }

      if (field.type === 'image') {
        const alignClass = cfg.align === 'center' ? 'mx-auto' : cfg.align === 'right' ? 'ml-auto' : 'mr-auto'
        return `        {/* Image Banner */}
        <div className="${spanClass} text-center">
          <img
            src="${cfg.src || ''}"
            alt="${cfg.alt || 'Form image'}"
            style={{ maxHeight: '${cfg.maxHeight || 240}px' }}
            className="w-full object-cover rounded-xl ${alignClass} shadow-xs"
          />
          ${cfg.caption ? `<p className="text-xs text-gray-500 mt-1 italic">${cfg.caption}</p>` : ''}
        </div>`
      }

      if (field.type === 'divider') {
        return `        {/* Divider */}
        <div className="${spanClass}">
          <Divider dashed={${!!cfg.dashed}}>${cfg.label || ''}</Divider>
        </div>`
      }

      if (field.type === 'checkbox') {
        return `        {/* Checkbox */}
        <div className="${spanClass} flex items-center pt-2">
          <Checkbox
            checked={!!formData.${field.id}}
            onChange={(checked) => handleChange('${field.id}', checked)}
          >
            ${cfg.label}${reqMarker}
          </Checkbox>
        </div>`
      }

      if (field.type === 'toggle') {
        return `        {/* Toggle */}
        <div className="${spanClass} flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50">
          <span className="text-sm font-medium text-gray-800">${cfg.label}${reqMarker}</span>
          <Toggle
            checked={!!formData.${field.id}}
            onChange={(checked) => handleChange('${field.id}', checked)}
          />
        </div>`
      }

      let controlJsx = ''
      switch (field.type) {
        case 'textarea':
          controlJsx = `<Textarea
            value={formData.${field.id} || ''}
            onChange={(val) => handleChange('${field.id}', val)}
            placeholder="${cfg.placeholder || ''}"
            rows={${cfg.rows || 4}}
            maxLength={${cfg.maxLength || 500}}
            showCount={${!!cfg.showCount}}
          />`
          break
        case 'number':
          controlJsx = `<InputNumber
            value={formData.${field.id}}
            onChange={(val) => handleChange('${field.id}', val)}
            placeholder="${cfg.placeholder || ''}"
            min={${cfg.min !== undefined ? cfg.min : 'undefined'}}
            max={${cfg.max !== undefined ? cfg.max : 'undefined'}}
            size="${cfg.size || 'md'}"
          />`
          break
        case 'password':
          controlJsx = `<PasswordInput
            value={formData.${field.id} || ''}
            onChange={(val) => handleChange('${field.id}', val)}
            placeholder="${cfg.placeholder || ''}"
            showToggle={${cfg.showToggle !== false}}
            size="${cfg.size || 'md'}"
          />`
          break
        case 'select':
          controlJsx = `<SelectPicker
            data={${JSON.stringify(cfg.options || [], null, 2).split('\n').join('\n            ')}}
            value={formData.${field.id}}
            onChange={(val) => handleChange('${field.id}', val)}
            placeholder="${cfg.placeholder || 'Select...'}"
            searchable={${cfg.searchable !== false}}
            cleanable={${cfg.cleanable !== false}}
            size="${cfg.size || 'md'}"
          />`
          break
        case 'checkpicker':
          controlJsx = `<CheckPicker
            data={${JSON.stringify(cfg.options || [], null, 2).split('\n').join('\n            ')}}
            value={formData.${field.id} || []}
            onChange={(vals) => handleChange('${field.id}', vals)}
            placeholder="${cfg.placeholder || 'Select multiple...'}"
            tagDisplay={${cfg.tagDisplay !== false}}
            size="${cfg.size || 'md'}"
          />`
          break
        case 'radio':
          controlJsx = `<RadioGroup
            value={formData.${field.id}}
            onChange={(val) => handleChange('${field.id}', val)}
            direction="${cfg.direction || 'vertical'}"
          >
            ${(cfg.options || [])
              .map(
                (o) =>
                  `<Radio value="${o.value}">${o.label}</Radio>`
              )
              .join('\n            ')}
          </RadioGroup>`
          break
        case 'datepicker':
          controlJsx = `<DatePicker
            value={formData.${field.id}}
            onChange={(dateStr) => handleChange('${field.id}', dateStr)}
            placeholder="${cfg.placeholder || 'Select date'}"
            cleanable
            size="${cfg.size || 'md'}"
          />`
          break
        case 'timepicker':
          controlJsx = `<TimePicker
            value={formData.${field.id}}
            onChange={(time) => handleChange('${field.id}', time)}
            placeholder="${cfg.placeholder || 'Select time'}"
            size="${cfg.size || 'md'}"
          />`
          break
        case 'slider':
          controlJsx = `<Slider
            defaultValue={50}
            min={${cfg.min || 0}}
            max={${cfg.max || 100}}
            onChange={(e) => handleChange('${field.id}', Number(e.target.value))}
            showValue
          />`
          break
        case 'rate':
          controlJsx = `<Rate
            value={formData.${field.id} || 0}
            onChange={(val) => handleChange('${field.id}', val)}
            max={${cfg.max || 5}}
            allowHalf
          />`
          break
        default:
          controlJsx = `<Input
            value={formData.${field.id} || ''}
            onChange={(val) => handleChange('${field.id}', val)}
            placeholder="${cfg.placeholder || ''}"
            clearable={${!!cfg.clearable}}
            size="${cfg.size || 'md'}"
            type="${field.type === 'email' ? 'email' : 'text'}"
          />`
          break
      }

      return `        {/* ${cfg.label} */}
        <div className="${spanClass} space-y-1.5">
          <label className="block text-sm font-semibold text-gray-800">
            ${cfg.label}${reqMarker}
          </label>
          ${controlJsx}
        </div>`
    })
    .join('\n\n')

  return `import React, { useState } from 'react'
import {
  ${importList}
} from '@rahilp010/custom-control'
import '@rahilp010/custom-control/styles.css'

export default function ${componentName}() {
  const [formData, setFormData] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form Submitted Data:', formData)
    setSubmitted(true)
    alert('Form submitted successfully!')
  }

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-100 my-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">${title || 'Untitled Form'}</h2>
        ${description ? `<p className="text-sm text-gray-500 mt-1">${description}</p>` : ''}
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-x-4 gap-y-5">
${fieldsJsx}

        {/* Submit Button */}
        <div className="col-span-12 pt-4 border-t border-gray-100">
          <Button type="submit" variant="primary" size="md">
            Submit
          </Button>
        </div>
      </form>
    </div>
  )
}
`
}
