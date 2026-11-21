import {
  LuType, LuHash, LuMail, LuLock, LuSearch, LuCalendar,
  LuClock, LuToggleLeft, LuSquareCheck, LuCircleDot,
  LuList, LuSlidersHorizontal, LuStar, LuPalette, LuUpload,
  LuFileText, LuAlignLeft, LuKeyRound, LuCalendarRange,
  LuListChecks, LuMinus, LuHeading, LuLetterText, LuImage
} from 'react-icons/lu'

// Every field type the builder supports, grouped by category
export const FIELD_CATEGORIES = [
  {
    id: 'text',
    label: 'Text Inputs',
    fields: [
      {
        type: 'input',
        label: 'Text Input',
        icon: LuType,
        description: 'Single-line text field',
        defaults: {
          label: 'Text Field',
          placeholder: 'Enter text...',
          required: false,
          disabled: false,
          size: 'md',
          clearable: false,
        },
      },
      {
        type: 'textarea',
        label: 'Textarea',
        icon: LuAlignLeft,
        description: 'Multi-line text area',
        defaults: {
          label: 'Message',
          placeholder: 'Enter your message...',
          required: false,
          disabled: false,
          rows: 4,
          maxLength: 500,
          showCount: true,
          resize: true,
        },
      },
      {
        type: 'number',
        label: 'Number',
        icon: LuHash,
        description: 'Numeric input with bounds',
        defaults: {
          label: 'Number',
          placeholder: '0',
          required: false,
          disabled: false,
          size: 'md',
          min: undefined,
          max: undefined,
          step: 1,
        },
      },
      {
        type: 'email',
        label: 'Email',
        icon: LuMail,
        description: 'Email address field',
        defaults: {
          label: 'Email Address',
          placeholder: 'name@example.com',
          required: false,
          disabled: false,
          size: 'md',
          clearable: true,
        },
      },
      {
        type: 'password',
        label: 'Password',
        icon: LuLock,
        description: 'Secure password input',
        defaults: {
          label: 'Password',
          placeholder: 'Enter password',
          required: false,
          disabled: false,
          size: 'md',
          showToggle: true,
        },
      },
      {
        type: 'search',
        label: 'Search',
        icon: LuSearch,
        description: 'Search input with clear',
        defaults: {
          label: 'Search',
          placeholder: 'Search...',
          disabled: false,
          size: 'md',
          cleanable: true,
        },
      },
      {
        type: 'otp',
        label: 'OTP Code',
        icon: LuKeyRound,
        description: 'One-time password input',
        defaults: {
          label: 'Verification Code',
          disabled: false,
          length: 6,
          otpType: 'numeric',
        },
      },
    ],
  },
  {
    id: 'selection',
    label: 'Selection',
    fields: [
      {
        type: 'select',
        label: 'Select Picker',
        icon: LuList,
        description: 'Single-select dropdown',
        defaults: {
          label: 'Select Option',
          placeholder: 'Choose...',
          required: false,
          disabled: false,
          size: 'md',
          searchable: true,
          cleanable: true,
          options: [
            { label: 'Option 1', value: 'opt1' },
            { label: 'Option 2', value: 'opt2' },
            { label: 'Option 3', value: 'opt3' },
          ],
        },
      },
      {
        type: 'checkpicker',
        label: 'Multi Select',
        icon: LuListChecks,
        description: 'Multi-select with tags',
        defaults: {
          label: 'Select Multiple',
          placeholder: 'Choose items...',
          required: false,
          disabled: false,
          size: 'md',
          searchable: true,
          tagDisplay: true,
          options: [
            { label: 'Item A', value: 'a' },
            { label: 'Item B', value: 'b' },
            { label: 'Item C', value: 'c' },
          ],
        },
      },
      {
        type: 'checkbox',
        label: 'Checkbox',
        icon: LuSquareCheck,
        description: 'Single checkbox toggle',
        defaults: {
          label: 'I agree to the terms',
          disabled: false,
        },
      },
      {
        type: 'radio',
        label: 'Radio Group',
        icon: LuCircleDot,
        description: 'Radio button group',
        defaults: {
          label: 'Choose One',
          disabled: false,
          direction: 'vertical',
          options: [
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
            { label: 'Option C', value: 'c' },
          ],
        },
      },
      {
        type: 'toggle',
        label: 'Toggle Switch',
        icon: LuToggleLeft,
        description: 'On/off toggle switch',
        defaults: {
          label: 'Enable Feature',
          disabled: false,
          size: 'md',
          checkedChildren: 'ON',
          unCheckedChildren: 'OFF',
        },
      },
    ],
  },
  {
    id: 'datetime',
    label: 'Date & Time',
    fields: [
      {
        type: 'datepicker',
        label: 'Date Picker',
        icon: LuCalendar,
        description: 'Calendar date picker',
        defaults: {
          label: 'Date',
          placeholder: 'Select date',
          required: false,
          disabled: false,
          size: 'md',
          cleanable: true,
          format: 'yyyy-MM-dd',
        },
      },
      {
        type: 'daterange',
        label: 'Date Range',
        icon: LuCalendarRange,
        description: 'Start and end date picker',
        defaults: {
          label: 'Date Range',
          placeholder: 'Select range',
          required: false,
          disabled: false,
          size: 'md',
        },
      },
      {
        type: 'timepicker',
        label: 'Time Picker',
        icon: LuClock,
        description: 'Time selection control',
        defaults: {
          label: 'Time',
          placeholder: 'Select time',
          required: false,
          disabled: false,
          size: 'md',
          cleanable: true,
          is12h: false,
        },
      },
    ],
  },
  {
    id: 'content',
    label: 'Text & Media Blocks',
    fields: [
      {
        type: 'heading',
        label: 'Section Heading',
        icon: LuHeading,
        description: 'Large title with optional subtitle',
        defaults: {
          label: 'Section Title',
          subtitle: 'Add explanatory details or section context here',
          align: 'left',
          colSpan: 12,
        },
      },
      {
        type: 'richtext',
        label: 'Rich Text Block',
        icon: LuLetterText,
        description: 'Formatted text, bullet points & links',
        defaults: {
          label: 'Information Block',
          content: '<p>Welcome! Please review the terms, instructions, or <strong>important guidelines</strong> before continuing. You can use <em>rich formatting</em> and bullet lists.</p>',
          colSpan: 12,
        },
      },
      {
        type: 'image',
        label: 'Image Banner',
        icon: LuImage,
        description: 'Image with caption & alignment',
        defaults: {
          label: 'Form Banner',
          src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
          alt: 'Header illustration',
          caption: 'Visual banner illustration',
          align: 'center',
          maxHeight: 220,
          rounded: 'lg',
          colSpan: 12,
        },
      },
    ],
  },
  {
    id: 'media',
    label: 'Media & Special',
    fields: [
      {
        type: 'slider',
        label: 'Slider',
        icon: LuSlidersHorizontal,
        description: 'Range slider control',
        defaults: {
          label: 'Value',
          disabled: false,
          min: 0,
          max: 100,
          step: 1,
          showValue: true,
        },
      },
      {
        type: 'rate',
        label: 'Star Rating',
        icon: LuStar,
        description: 'Star-based rating',
        defaults: {
          label: 'Rating',
          disabled: false,
          max: 5,
          allowHalf: true,
          size: 'md',
        },
      },
      {
        type: 'colorpicker',
        label: 'Color Picker',
        icon: LuPalette,
        description: 'Color selection control',
        defaults: {
          label: 'Color',
          disabled: false,
          showValue: true,
        },
      },
      {
        type: 'uploader',
        label: 'File Upload',
        icon: LuUpload,
        description: 'Drag & drop file uploader',
        defaults: {
          label: 'Upload File',
          disabled: false,
          accept: '*',
          draggable: true,
        },
      },
      {
        type: 'divider',
        label: 'Divider',
        icon: LuMinus,
        description: 'Visual section separator',
        defaults: {
          label: '',
          direction: 'horizontal',
          dashed: false,
        },
      },
    ],
  },
]

// Flat lookup for quick access
export const FIELD_REGISTRY = {}
FIELD_CATEGORIES.forEach((cat) =>
  cat.fields.forEach((f) => {
    FIELD_REGISTRY[f.type] = f
  })
)

// Generate a unique id for each dropped field
let _counter = 0
export const generateFieldId = () => `field_${Date.now()}_${++_counter}`
