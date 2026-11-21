// ── 12-Column Grid Layout Helpers ────────────────────────────────
// The canvas is a CSS `grid-cols-12` with auto flow, so fields are
// packed into visual rows exactly the same way here. These helpers keep
// every row filled: controls that share a row split the 12 columns.

export const GRID_COLUMNS = 12

export const getFieldSpan = (field) => {
  const raw = Number(field?.config?.colSpan)
  if (!Number.isFinite(raw)) return GRID_COLUMNS
  return Math.max(1, Math.min(GRID_COLUMNS, Math.round(raw)))
}

// Mirrors CSS grid auto-placement: a field that doesn't fit on the
// current row wraps to the next one.
export const groupFieldsIntoRows = (fields = []) => {
  const rows = []
  let row = []
  let used = 0

  fields.forEach((field) => {
    const span = getFieldSpan(field)
    if (row.length > 0 && used + span > GRID_COLUMNS) {
      rows.push(row)
      row = []
      used = 0
    }
    row.push(field)
    used += span
  })

  if (row.length > 0) rows.push(row)
  return rows
}

export const getRowFields = (fields, fieldId) =>
  groupFieldsIntoRows(fields).find((row) => row.some((f) => f.id === fieldId)) || []

// Equal shares, with the remainder given to the first controls so the
// row always totals exactly 12 columns (e.g. 2 -> 6/6, 3 -> 4/4/4).
export const splitEvenly = (count, total = GRID_COLUMNS) => {
  if (count <= 0) return []
  const base = Math.floor(total / count)
  const remainder = total - base * count
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0))
}

// Give every sibling at least one column, then split the leftover
// proportionally to how much space each control already had.
const splitProportionally = (weights, budget) => {
  const count = weights.length
  if (count === 0) return []
  if (budget <= count) return weights.map(() => 1)

  const extra = budget - count
  const weightTotal = weights.reduce((sum, w) => sum + w, 0) || count
  const shares = weights.map((w) => (w / weightTotal) * extra)
  const floors = shares.map((v) => Math.floor(v))
  let leftover = extra - floors.reduce((sum, v) => sum + v, 0)

  const order = shares
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)

  let cursor = 0
  while (leftover > 0) {
    floors[order[cursor % count].i] += 1
    leftover -= 1
    cursor += 1
  }

  return floors.map((v) => 1 + v)
}

// Resize one control in a row and resize its siblings to keep the row full.
export const rebalanceRowSpans = (rowFields, changedId, requestedSpan) => {
  const count = rowFields.length
  if (count === 0) return []

  const maxSpan = GRID_COLUMNS - (count - 1)
  const requested = Math.round(Number(requestedSpan))
  const safeRequested = Number.isFinite(requested) ? requested : GRID_COLUMNS
  const span = Math.max(1, Math.min(safeRequested, maxSpan))

  if (count === 1) return [{ id: rowFields[0].id, span }]

  const others = rowFields.filter((f) => f.id !== changedId)
  const shares = splitProportionally(others.map(getFieldSpan), GRID_COLUMNS - span)

  return [
    { id: changedId, span },
    ...others.map((f, i) => ({ id: f.id, span: shares[i] })),
  ]
}

// Build the span list for a row that just received a new/duplicated control.
export const buildRowSpansWithNewField = (rowFields, newId, targetId, position = 'after') => {
  const ids = rowFields.map((f) => f.id)
  const targetIdx = Math.max(0, ids.indexOf(targetId))
  const insertAt = position === 'before' ? targetIdx : targetIdx + 1
  ids.splice(insertAt, 0, newId)

  const spans = splitEvenly(ids.length)
  return ids.map((id, i) => ({ id, span: spans[i] }))
}

export const applySpanMap = (fields, entries) => {
  if (!entries.length) return fields
  const spanMap = new Map(entries.map(({ id, span }) => [id, span]))

  return fields.map((field) => {
    if (!spanMap.has(field.id)) return field
    const span = spanMap.get(field.id)
    if (getFieldSpan(field) === span) return field
    return { ...field, config: { ...field.config, colSpan: span } }
  })
}

// Resize a single control and adjust the rest of its row accordingly.
export const balanceFieldSpan = (fields, fieldId, requestedSpan) => {
  const row = getRowFields(fields, fieldId)
  if (!row.length) return fields
  return applySpanMap(fields, rebalanceRowSpans(row, fieldId, requestedSpan))
}

// Make the remaining controls in a row share the space equally.
// `fillSingle` expands the last remaining control to full width.
export const equalizeRow = (fields, fieldId, { fillSingle = false } = {}) => {
  const row = getRowFields(fields, fieldId)
  if (!row.length) return fields

  if (row.length === 1) {
    if (!fillSingle) return fields
    return applySpanMap(fields, [{ id: row[0].id, span: GRID_COLUMNS }])
  }

  const spans = splitEvenly(row.length)
  return applySpanMap(
    fields,
    row.map((f, i) => ({ id: f.id, span: spans[i] }))
  )
}

// Equalize a known set of ids (used after a control leaves its old row).
export const equalizeRowIds = (fields, ids, { fillSingle = false } = {}) => {
  if (!ids.length) return fields
  if (ids.length === 1) {
    if (!fillSingle) return fields
    return applySpanMap(fields, [{ id: ids[0], span: GRID_COLUMNS }])
  }

  const spans = splitEvenly(ids.length)
  return applySpanMap(
    fields,
    ids.map((id, i) => ({ id, span: spans[i] }))
  )
}
