import {
  Input,
  InputNumber,
  Textarea,
  PasswordInput,
  SearchInput,
  OtpInput,
  SelectPicker,
  CheckPicker,
  Checkbox,
  Radio,
  RadioGroup,
  Toggle,
  DatePicker,
  DateRangePicker,
  TimePicker,
  Slider,
  Rate,
  ColorPicker,
  Uploader,
  Divider,
  FormField,
} from '@rahilp010/custom-control'

/**
 * Renders the correct @rahilp010/custom-control component
 * based on the field type and its config.
 */
export default function FieldRenderer({ type, config, isPreview = false }) {
  const common = {
    disabled: config.disabled,
    size: config.size,
  }

  switch (type) {
    case 'input':
      return (
        <Input
          {...common}
          placeholder={config.placeholder}
          clearable={config.clearable}
          type="text"
        />
      )

    case 'email':
      return (
        <Input
          {...common}
          placeholder={config.placeholder}
          clearable={config.clearable}
          type="email"
        />
      )

    case 'textarea':
      return (
        <Textarea
          disabled={config.disabled}
          placeholder={config.placeholder}
          rows={config.rows}
          maxLength={config.maxLength}
          showCount={config.showCount}
          resize={config.resize}
        />
      )

    case 'number':
      return (
        <InputNumber
          {...common}
          placeholder={config.placeholder}
          min={config.min}
          max={config.max}
          step={config.step}
        />
      )

    case 'password':
      return (
        <PasswordInput
          {...common}
          placeholder={config.placeholder}
          showToggle={config.showToggle}
        />
      )

    case 'search':
      return (
        <SearchInput
          {...common}
          placeholder={config.placeholder}
          cleanable={config.cleanable}
        />
      )

    case 'otp':
      return (
        <OtpInput
          length={config.length}
          type={config.otpType}
          disabled={config.disabled}
        />
      )

    case 'select':
      return (
        <SelectPicker
          {...common}
          data={config.options || []}
          placeholder={config.placeholder}
          searchable={config.searchable}
          cleanable={config.cleanable}
        />
      )

    case 'checkpicker':
      return (
        <CheckPicker
          {...common}
          data={config.options || []}
          placeholder={config.placeholder}
          searchable={config.searchable}
          tagDisplay={config.tagDisplay}
        />
      )

    case 'checkbox':
      return (
        <Checkbox disabled={config.disabled}>
          {config.label}
        </Checkbox>
      )

    case 'radio':
      return (
        <RadioGroup
          disabled={config.disabled}
          direction={config.direction}
        >
          {(config.options || []).map((opt) => (
            <Radio key={opt.value} value={opt.value}>
              {opt.label}
            </Radio>
          ))}
        </RadioGroup>
      )

    case 'toggle':
      return (
        <Toggle
          disabled={config.disabled}
          size={config.size}
          checkedChildren={config.checkedChildren}
          unCheckedChildren={config.unCheckedChildren}
        />
      )

    case 'datepicker':
      return (
        <DatePicker
          {...common}
          placeholder={config.placeholder}
          cleanable={config.cleanable}
          format={config.format}
        />
      )

    case 'daterange':
      return (
        <DateRangePicker
          {...common}
          placeholder={config.placeholder}
        />
      )

    case 'timepicker':
      return (
        <TimePicker
          {...common}
          placeholder={config.placeholder}
          cleanable={config.cleanable}
          is12h={config.is12h}
        />
      )

    case 'slider':
      return (
        <Slider
          disabled={config.disabled}
          min={config.min}
          max={config.max}
          step={config.step}
          showValue={config.showValue}
          defaultValue={Math.round(((config.min || 0) + (config.max || 100)) / 2)}
        />
      )

    case 'rate':
      return (
        <Rate
          disabled={config.disabled}
          max={config.max}
          allowHalf={config.allowHalf}
          size={config.size}
          defaultValue={3}
        />
      )

    case 'colorpicker':
      return (
        <ColorPicker
          disabled={config.disabled}
          showValue={config.showValue}
          defaultValue="#2f5d46"
        />
      )

    case 'uploader':
      return (
        <Uploader
          disabled={config.disabled}
          draggable={config.draggable}
          accept={config.accept}
        >
          <div
            className="flex flex-col items-center justify-center py-6 px-4 text-center rounded-lg border-2 border-dashed transition-colors"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Drop files here or click to upload
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {config.accept === '*' ? 'Any file type' : config.accept}
            </p>
          </div>
        </Uploader>
      )

    case 'heading': {
      const alignClass = config.align === 'center' ? 'text-center' : config.align === 'right' ? 'text-right' : 'text-left'
      return (
        <div className={`py-1 ${alignClass}`}>
          <h3 className="text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {config.label || 'Heading'}
          </h3>
          {config.subtitle && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {config.subtitle}
            </p>
          )}
        </div>
      )
    }

    case 'richtext':
      return (
        <div
          className="text-sm leading-relaxed prose prose-sm max-w-none p-1"
          style={{ color: 'var(--text-primary)' }}
          dangerouslySetInnerHTML={{ __html: config.content || '<p>Empty text block</p>' }}
        />
      )

    case 'image': {
      const alignClass = config.align === 'center' ? 'mx-auto' : config.align === 'right' ? 'ml-auto' : 'mr-auto'
      const roundedClass = config.rounded === 'none' ? 'rounded-none' : config.rounded === 'full' ? 'rounded-full' : config.rounded === 'sm' ? 'rounded-sm' : 'rounded-xl'
      return (
        <div className="w-full text-center">
          <img
            src={config.src || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80'}
            alt={config.alt || 'Banner'}
            style={{ maxHeight: `${config.maxHeight || 220}px` }}
            className={`w-full object-cover ${roundedClass} ${alignClass} border shadow-xs`}
          />
          {config.caption && (
            <p className="text-[11px] mt-1.5 italic" style={{ color: 'var(--text-muted)' }}>
              {config.caption}
            </p>
          )}
        </div>
      )
    }

    case 'divider':
      return (
        <Divider
          direction={config.direction}
          dashed={config.dashed}
        >
          {config.label || null}
        </Divider>
      )

    default:
      return (
        <div
          className="p-3 rounded-lg text-sm text-center"
          style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
        >
          Unsupported field: {type}
        </div>
      )
  }
}
