/**
 * Professional Form PDF Generator
 * Renders a print-ready vector document and triggers the browser's native Save-as-PDF.
 */
export function exportFormToPdf({ title, description, fields }) {
  const printWindow = window.open('', '_blank', 'width=850,height=1100')
  if (!printWindow) {
    alert('Please allow popups to download the PDF')
    return
  }

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const fieldsHtml = fields
    .map((field, idx) => {
      const cfg = field.config || {}
      const label = cfg.label || field.type
      const req = cfg.required ? '<span style="color: #dc2626;"> *</span>' : ''
      const span = cfg.colSpan || 12
      const widthPct = Math.round((span / 12) * 100)

      let controlHtml = ''
      switch (field.type) {
        case 'textarea':
          controlHtml = `<div class="field-box field-textarea">${cfg.placeholder || 'Write here...'}</div>`
          break
        case 'select':
        case 'checkpicker':
          const opts = (cfg.options || [])
            .map((o) => `<span class="pill">${o.label}</span>`)
            .join(' ')
          controlHtml = `<div class="options-row">${opts || '<span style="color:#999;">No options</span>'}</div>`
          break
        case 'radio':
        case 'checkbox':
          const choices = (cfg.options || [
            { label: cfg.label || 'Option 1' },
          ])
            .map(
              (o) =>
                `<label class="check-item"><span class="box"></span> ${o.label}</label>`
            )
            .join(' ')
          controlHtml = `<div class="choice-group">${choices}</div>`
          break
        case 'toggle':
          controlHtml = `<div class="toggle-mock"><span class="toggle-knob"></span> ${cfg.label || 'Toggle'}</div>`
          break
        case 'rate':
          controlHtml = `<div class="star-row">★ ★ ★ ★ ★ <span style="font-size: 11px; color: #888;">(${cfg.max || 5} Stars)</span></div>`
          break
        case 'slider':
          controlHtml = `<div class="slider-mock"><div class="slider-bar"></div><span>${cfg.min || 0}</span> — <span>${cfg.max || 100}</span></div>`
          break
        case 'heading':
          return `
            <div class="field-col" style="flex: 0 0 calc(${widthPct}% - 12px); max-width: calc(${widthPct}% - 12px); text-align: ${cfg.align || 'left'}; margin-top: 10px;">
              <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 2px 0;">${cfg.label || 'Heading'}</h2>
              ${cfg.subtitle ? `<p style="font-size: 12px; color: #6b7280; margin: 0;">${cfg.subtitle}</p>` : ''}
            </div>
          `
        case 'richtext':
          return `
            <div class="field-col" style="flex: 0 0 calc(${widthPct}% - 12px); max-width: calc(${widthPct}% - 12px);">
              <div style="font-size: 12px; color: #374151; line-height: 1.5;">${cfg.content || ''}</div>
            </div>
          `
        case 'image':
          return `
            <div class="field-col" style="flex: 0 0 calc(${widthPct}% - 12px); max-width: calc(${widthPct}% - 12px); text-align: ${cfg.align || 'center'};">
              <img src="${cfg.src || ''}" style="max-height: ${Math.min(180, cfg.maxHeight || 180)}px; width: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;" />
              ${cfg.caption ? `<p style="font-size: 10px; color: #9ca3af; margin: 4px 0 0 0; font-style: italic;">${cfg.caption}</p>` : ''}
            </div>
          `
        case 'divider':
          return `<div class="divider" style="width: 100%; border-bottom: 1.5px ${cfg.dashed ? 'dashed' : 'solid'} #e5e7eb; margin: 16px 0;"></div>`
        default:
          controlHtml = `<div class="field-box">${cfg.placeholder || ''}</div>`
      }

      return `
        <div class="field-col" style="flex: 0 0 calc(${widthPct}% - 12px); max-width: calc(${widthPct}% - 12px);">
          <div class="field-wrapper">
            <div class="field-label">${label}${req}</div>
            ${controlHtml}
          </div>
        </div>
      `
    })
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title || 'Form Document'} - PDF</title>
      <style>
        @page {
          size: A4;
          margin: 18mm 15mm 18mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #111827;
          background: #ffffff;
          margin: 0;
          padding: 24px 32px;
          line-height: 1.45;
          font-size: 13px;
        }
        .header {
          border-bottom: 2px solid #2f5d46;
          padding-bottom: 14px;
          margin-bottom: 22px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
        }
        .desc {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }
        .meta {
          text-align: right;
          font-size: 11px;
          color: #9ca3af;
        }
        .grid-container {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .field-col {
          display: inline-block;
          vertical-align: top;
          margin-bottom: 12px;
        }
        .field-wrapper {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px 12px;
          background: #fafafa;
        }
        .field-label {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .field-box {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #ffffff;
          height: 32px;
          padding: 6px 10px;
          font-size: 12px;
          color: #9ca3af;
        }
        .field-textarea {
          height: 60px;
        }
        .options-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .pill {
          display: inline-block;
          padding: 3px 8px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-size: 11px;
          background: #ffffff;
          color: #4b5563;
        }
        .choice-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .check-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #374151;
        }
        .box {
          width: 14px;
          height: 14px;
          border: 1.5px solid #9ca3af;
          border-radius: 3px;
          display: inline-block;
        }
        .star-row {
          color: #f59e0b;
          font-size: 16px;
          letter-spacing: 3px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 14px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #9ca3af;
        }
        .sign-area {
          display: flex;
          gap: 40px;
          margin-top: 24px;
        }
        .sign-box {
          flex: 1;
          border-bottom: 1px solid #9ca3af;
          padding-bottom: 4px;
          font-size: 11px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">${title || 'Untitled Form'}</h1>
          <p class="desc">${description || 'Please complete all required fields.'}</p>
        </div>
        <div class="meta">
          <div>Form ID: ${Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
          <div>Date: ${dateStr}</div>
        </div>
      </div>

      <div class="grid-container">
        ${fieldsHtml}
      </div>

      <div class="sign-area">
        <div class="sign-box">Respondent Signature</div>
        <div class="sign-box">Date</div>
      </div>

      <div class="footer">
        <span>Generated with FormBuilder</span>
        <span>Page 1 of 1</span>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
