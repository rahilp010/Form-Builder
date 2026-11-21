import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { generateFieldId, FIELD_REGISTRY } from '../data/fieldDefinitions'
import {
  applySpanMap,
  balanceFieldSpan,
  buildRowSpansWithNewField,
  equalizeRowIds,
  getRowFields,
  splitEvenly,
} from '../utils/gridLayout'

const createInitialFormId = () => `form_${Date.now()}`

export const useFormStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ── Form Identity ─────────────────────────────────────────
        formId: createInitialFormId(),
        formTitle: 'Untitled Form',
        formDescription: 'Please fill out the form below',

        setFormTitle: (title) => set({ formTitle: title }),
        setFormDescription: (desc) => set({ formDescription: desc }),

        // ── Navigation View: 'dashboard' | 'editor' | 'preview' | 'responses' ──
        activeView: 'dashboard',
        setActiveView: (view) => set({ activeView: view }),

        // ── Form fields on the canvas ────────────────────────────
        fields: [],

        // ── Currently selected field id ──────────────────────────
        selectedFieldId: null,

        // ── Sidebar search / category filter ─────────────────────
        sidebarSearch: '',
        setSidebarSearch: (q) => set({ sidebarSearch: q }),

        // ── Panel visibility ─────────────────────────────────────
        showProperties: true,
        setShowProperties: (v) => set({ showProperties: v }),

        // ── Drag & Drop state for smooth canvas guides ──────────
        isDragging: false,
        draggedFieldId: null,
        dragItem: null,
        setDragState: (isDragging, dragItem = null) =>
          set({
            isDragging,
            dragItem,
            draggedFieldId:
              dragItem?.id || (typeof dragItem === 'string' ? dragItem : null),
          }),

        // ── Save & Share Modal ───────────────────────────────────
        isSavedModalOpen: false,
        setIsSavedModalOpen: (open) => set({ isSavedModalOpen: open }),
        lastSavedAt: null,

        // ── Saved Forms Registry: { [formId]: formObject } ──────
        savedForms: {},

        // ── Responses Registry: { [formId]: [ { id, submittedAt, answers } ] }
        responses: {},

        // ── Theme ────────────────────────────────────────────────
        theme: 'light',
        toggleTheme: () =>
          set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

        // ── Add a new field to the canvas (default at end or target index) ──
        addField: (type, targetIndex = null, colSpan = null) => {
          const def = FIELD_REGISTRY[type]
          if (!def) return
          const id = generateFieldId()
          const newField = {
            id,
            type,
            config: {
              colSpan: colSpan || def.defaults?.colSpan || 12,
              ...def.defaults,
              ...(colSpan ? { colSpan } : {}),
            },
          }
          set((s) => {
            const next = [...s.fields]
            if (targetIndex !== null && targetIndex >= 0 && targetIndex <= next.length) {
              next.splice(targetIndex, 0, newField)
            } else {
              next.push(newField)
            }
            return {
              fields: next,
              selectedFieldId: id,
            }
          })
        },

        // ── Add a new field relative to a target control (above or below) ──
        addFieldRelative: (type, targetId, position = 'after') => {
          const def = FIELD_REGISTRY[type]
          if (!def) return
          const id = generateFieldId()
          const newField = {
            id,
            type,
            config: {
              colSpan: 12,
              ...def.defaults,
            },
          }
          set((s) => {
            const targetIndex = s.fields.findIndex((f) => f.id === targetId)
            const next = [...s.fields]
            if (targetIndex === -1) {
              next.push(newField)
            } else {
              const insertAt = position === 'before' ? targetIndex : targetIndex + 1
              next.splice(insertAt, 0, newField)
            }
            return {
              fields: next,
              selectedFieldId: id,
            }
          })
        },

        // ── Add a new field into an existing row ─────────────────
        // The controls sharing that row always split the 12 columns
        // equally, so rows never overflow or leave half-empty gaps.
        addFieldToRow: (type, targetId, position = 'after') => {
          const def = FIELD_REGISTRY[type]
          if (!def) return
          const newId = generateFieldId()

          set((s) => {
            const targetIndex = s.fields.findIndex((f) => f.id === targetId)
            const newField = {
              id: newId,
              type,
              config: { colSpan: 12, ...def.defaults },
            }

            if (targetIndex === -1) {
              return {
                fields: [...s.fields, newField],
                selectedFieldId: newId,
              }
            }

            const row = getRowFields(s.fields, targetId)
            const insertAt = position === 'before' ? targetIndex : targetIndex + 1
            const next = [...s.fields]
            next.splice(insertAt, 0, newField)

            return {
              fields: applySpanMap(
                next,
                buildRowSpansWithNewField(row, newId, targetId, position)
              ),
              selectedFieldId: newId,
            }
          })
        },

        // ── Select a field ───────────────────────────────────────
        selectField: (id) => set({ selectedFieldId: id }),
        clearSelection: () => set({ selectedFieldId: null }),

        // ── Get the selected field object ────────────────────────
        getSelectedField: () => {
          const { fields, selectedFieldId } = get()
          return fields.find((f) => f.id === selectedFieldId) || null
        },

        // ── Update a field's config ──────────────────────────────
        // Width changes go through the row balancer so the other
        // controls in the same row grow/shrink accordingly.
        updateFieldConfig: (id, patch) => {
          const { colSpan, ...rest } = patch || {}
          set((s) => {
            let fields = s.fields
            if (colSpan !== undefined) {
              fields = balanceFieldSpan(fields, id, colSpan)
            }
            if (Object.keys(rest).length > 0) {
              fields = fields.map((f) =>
                f.id === id ? { ...f, config: { ...f.config, ...rest } } : f
              )
            }
            return { fields }
          })
        },

        // ── Update field column span (1-12) ──────────────────────
        // Siblings in the same row are resized proportionally so the
        // row still fills all 12 columns.
        setFieldColSpan: (id, colSpan) =>
          set((s) => ({
            fields: balanceFieldSpan(s.fields, id, colSpan),
          })),

        // ── Remove a field ───────────────────────────────────────
        removeField: (id) =>
          set((s) => {
            const row = getRowFields(s.fields, id)
            let fields = s.fields.filter((f) => f.id !== id)

            if (row.length > 1) {
              const remaining = row.filter((f) => f.id !== id).map((f) => f.id)
              fields = equalizeRowIds(fields, remaining, { fillSingle: true })
            }

            return {
              fields,
              selectedFieldId: s.selectedFieldId === id ? null : s.selectedFieldId,
            }
          }),

        // ── Duplicate a field ────────────────────────────────────
        duplicateField: (id) =>
          set((s) => {
            const idx = s.fields.findIndex((f) => f.id === id)
            if (idx === -1) return s
            const src = s.fields[idx]
            const newId = generateFieldId()
            const copy = {
              ...src,
              id: newId,
              config: { ...src.config, label: src.config.label + ' (copy)' },
            }
            const row = getRowFields(s.fields, id)
            const next = [...s.fields]
            next.splice(idx + 1, 0, copy)

            // Adding a copy to a shared row splits space equally again.
            const nextFields =
              row.length > 1
                ? applySpanMap(
                    next,
                    buildRowSpansWithNewField(row, newId, id, 'after')
                  )
                : next

            return { fields: nextFields, selectedFieldId: newId }
          }),

        // ── Move field up/down ───────────────────────────────────
        moveField: (id, direction) =>
          set((s) => {
            const idx = s.fields.findIndex((f) => f.id === id)
            if (idx === -1) return s
            const target = direction === 'up' ? idx - 1 : idx + 1
            if (target < 0 || target >= s.fields.length) return s
            const next = [...s.fields]
            ;[next[idx], next[target]] = [next[target], next[idx]]
            return { fields: next }
          }),

        // ── Reorder (for drag-drop) ──────────────────────────────
        reorderFields: (fromIdx, toIdx) =>
          set((s) => {
            if (
              fromIdx === toIdx ||
              fromIdx < 0 ||
              fromIdx >= s.fields.length ||
              toIdx < 0 ||
              toIdx >= s.fields.length
            ) {
              return s
            }
            const next = [...s.fields]
            const [moved] = next.splice(fromIdx, 1)
            next.splice(toIdx, 0, moved)
            return { fields: next }
          }),

        // ── Move field relative to another field (above or below) ──
        moveFieldRelative: (fromId, targetId, position = 'after') =>
          set((s) => {
            if (!fromId || !targetId || fromId === targetId) return s
            const fromIdx = s.fields.findIndex((f) => f.id === fromId)
            const targetIdx = s.fields.findIndex((f) => f.id === targetId)
            if (fromIdx === -1 || targetIdx === -1) return s

            const moved = s.fields[fromIdx]
            const originRow = getRowFields(s.fields, moved.id)
            let next = s.fields.filter((f) => f.id !== fromId)

            // Equalize remaining controls in origin row if needed
            if (originRow.length > 1) {
              const remaining = originRow
                .filter((f) => f.id !== moved.id)
                .map((f) => f.id)
              next = equalizeRowIds(next, remaining, { fillSingle: true })
            }

            const newTargetIdx = next.findIndex((f) => f.id === targetId)
            if (newTargetIdx === -1) {
              next.push(moved)
            } else {
              const insertAt = position === 'before' ? newTargetIdx : newTargetIdx + 1
              next.splice(insertAt, 0, moved)
            }

            return { fields: next, selectedFieldId: moved.id }
          }),

        // ── Move field to the very end of the form ─────────────────
        moveFieldToEnd: (id) =>
          set((s) => {
            if (!id) return s
            const fromIdx = s.fields.findIndex((f) => f.id === id)
            if (fromIdx === -1) return s
            if (fromIdx === s.fields.length - 1) return s

            const moved = s.fields[fromIdx]
            const originRow = getRowFields(s.fields, moved.id)
            let next = s.fields.filter((f) => f.id !== id)

            if (originRow.length > 1) {
              const remaining = originRow
                .filter((f) => f.id !== moved.id)
                .map((f) => f.id)
              next = equalizeRowIds(next, remaining, { fillSingle: true })
            }

            next.push(moved)
            return { fields: next, selectedFieldId: moved.id }
          }),

        // ── Move a control into the row of another control ───────
        // Dragged controls join the destination row and every control
        // in that row gets an equal share; the old row is re-balanced.
        moveFieldToRow: (from, targetId, position = 'after') =>
          set((s) => {
            const fromIndex =
              typeof from === 'string'
                ? s.fields.findIndex((f) => f.id === from)
                : from
            if (fromIndex < 0 || fromIndex >= s.fields.length) return s
            const moved = s.fields[fromIndex]
            if (!moved || moved.id === targetId) return s

            const targetIndex = s.fields.findIndex((f) => f.id === targetId)
            if (targetIndex === -1) return s

            const targetRow = getRowFields(s.fields, targetId)
            const originRow = getRowFields(s.fields, moved.id)

            const rest = s.fields.filter((_, i) => i !== fromIndex)
            const targetIdxRest = rest.findIndex((f) => f.id === targetId)
            if (targetIdxRest === -1) return s

            let fields = [...rest]
            fields.splice(
              position === 'before' ? targetIdxRest : targetIdxRest + 1,
              0,
              moved
            )

            // Re-balance the row the control left behind first…
            if (originRow.length > 1) {
              const originRemaining = originRow
                .filter((f) => f.id !== moved.id)
                .map((f) => f.id)
              fields = equalizeRowIds(fields, originRemaining, { fillSingle: true })
            }

            // …then give the destination row equal shares.
            const destinationIds = targetRow
              .filter((f) => f.id !== moved.id)
              .map((f) => f.id)
            const targetRel = Math.max(0, destinationIds.indexOf(targetId))
            destinationIds.splice(
              position === 'before' ? targetRel : targetRel + 1,
              0,
              moved.id
            )
            const spans = splitEvenly(destinationIds.length)
            fields = applySpanMap(
              fields,
              destinationIds.map((id, i) => ({ id, span: spans[i] }))
            )

            return { fields, selectedFieldId: moved.id }
          }),

        // ── Clear all fields ─────────────────────────────────────
        clearAll: () => set({ fields: [], selectedFieldId: null }),

        // ── Save Form ────────────────────────────────────────────
        saveCurrentForm: () => {
          const { formId, formTitle, formDescription, fields, savedForms } = get()
          const now = new Date().toISOString()
          const formRecord = {
            id: formId,
            title: formTitle || 'Untitled Form',
            description: formDescription || '',
            fields: [...fields],
            savedAt: now,
          }

          set({
            savedForms: {
              ...savedForms,
              [formId]: formRecord,
            },
            lastSavedAt: now,
            isSavedModalOpen: true,
          })
          return formRecord
        },

        // ── Load Form by ID ──────────────────────────────────────
        loadForm: (targetId) => {
          const { savedForms } = get()
          const form = savedForms[targetId]
          if (form) {
            set({
              formId: form.id,
              formTitle: form.title,
              formDescription: form.description,
              fields: form.fields,
              selectedFieldId: null,
            })
            return true
          }
          return false
        },

        // ── Delete a Saved Form (and its responses) ──────────────
        deleteForm: (targetId) =>
          set((s) => {
            const savedForms = { ...s.savedForms }
            const responses = { ...s.responses }
            delete savedForms[targetId]
            delete responses[targetId]

            if (s.formId !== targetId) {
              return { savedForms, responses }
            }

            // Deleting the form currently open resets the editor.
            return {
              savedForms,
              responses,
              formId: createInitialFormId(),
              formTitle: 'Untitled Form',
              formDescription: 'Please fill out the form below',
              fields: [],
              selectedFieldId: null,
              activeView: 'editor',
            }
          }),

        // ── Create New Fresh Form ────────────────────────────────
        createNewForm: () => {
          const newId = createInitialFormId()
          set({
            formId: newId,
            formTitle: 'Untitled Form',
            formDescription: 'Please fill out the form below',
            fields: [],
            selectedFieldId: null,
            activeView: 'editor',
          })
        },

        // ── Submit Response ──────────────────────────────────────
        submitResponse: (targetFormId, answers) => {
          const { responses } = get()
          const currentList = responses[targetFormId] || []
          const newResponse = {
            id: `resp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            submittedAt: new Date().toISOString(),
            answers,
          }
          const updated = [newResponse, ...currentList]
          set({
            responses: {
              ...responses,
              [targetFormId]: updated,
            },
          })
          return newResponse
        },

        // ── Delete a Response ────────────────────────────────────
        deleteResponse: (targetFormId, responseId) => {
          const { responses } = get()
          const currentList = responses[targetFormId] || []
          set({
            responses: {
              ...responses,
              [targetFormId]: currentList.filter((r) => r.id !== responseId),
            },
          })
        },

        // ── Clear All Responses for Form ─────────────────────────
        clearResponses: (targetFormId) => {
          const { responses } = get()
          set({
            responses: {
              ...responses,
              [targetFormId]: [],
            },
          })
        },

        // ── Get Responses Count for Form ─────────────────────────
        getResponsesCount: (targetFormId) => {
          const { responses } = get()
          return (responses[targetFormId] || []).length
        },

        // ── Export form JSON ─────────────────────────────────────
        exportJSON: () => {
          const { formId, formTitle, formDescription, fields } = get()
          return JSON.stringify(
            {
              id: formId,
              title: formTitle,
              description: formDescription,
              fields: fields.map(({ type, config }) => ({ type, ...config })),
            },
            null,
            2
          )
        },

        // ── Export Responses CSV ─────────────────────────────────
        exportResponsesCSV: (targetFormId) => {
          const { responses, fields, formTitle } = get()
          const formResponses = responses[targetFormId] || []
          if (formResponses.length === 0) return

          // Build headers
          const fieldHeaders = fields.map((f) => f.config?.label || f.type)
          const headers = ['Response ID', 'Submitted At', ...fieldHeaders]

          // Build rows
          const rows = formResponses.map((r) => {
            const rowValues = [
              r.id,
              new Date(r.submittedAt).toLocaleString(),
              ...fields.map((f) => {
                const val = r.answers[f.id]
                if (val === undefined || val === null) return ''
                if (typeof val === 'object') return JSON.stringify(val)
                return String(val).replace(/"/g, '""')
              }),
            ]
            return rowValues.map((v) => `"${v}"`).join(',')
          })

          const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows].join('\n')
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${(formTitle || 'form').replace(/\s+/g, '_')}_responses.csv`
          a.click()
          URL.revokeObjectURL(url)
        },
      }),
      {
        name: 'formbuilder_storage_v2',
        partialize: (state) => ({
          formId: state.formId,
          formTitle: state.formTitle,
          formDescription: state.formDescription,
          fields: state.fields,
          savedForms: state.savedForms,
          responses: state.responses,
          theme: state.theme,
        }),
      }
    )
  )
)
