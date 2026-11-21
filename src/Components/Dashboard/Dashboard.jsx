import { useMemo } from 'react'
import { useFormStore } from '../../Store/formStore'
import { motion } from 'motion/react'
import {
  LuArrowRight,
  LuChartColumn,
  LuClock,
  LuFileText,
  LuInbox,
  LuLayers,
  LuPenLine,
  LuPlus,
  LuTrendingDown,
  LuTrendingUp,
} from 'react-icons/lu'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function startOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

function shortDate(date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function buildWeeklySeries(rows, weeks = 8) {
  const currentStart = startOfWeek(new Date())
  return Array.from({ length: weeks }, (_, i) => {
    const start = new Date(currentStart.getTime() - (weeks - 1 - i) * WEEK_MS)
    const end = new Date(start.getTime() + WEEK_MS)
    const count = rows.filter((r) => {
      const t = new Date(r.submittedAt).getTime()
      return Number.isFinite(t) && t >= start.getTime() && t < end.getTime()
    }).length
    return { start, end, count, label: shortDate(start) }
  })
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diff)) return 'Recently'
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function initialsOf(title) {
  const words = (title || 'Untitled').trim().split(/\s+/)
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function Dashboard() {
  const savedForms = useFormStore((s) => s.savedForms)
  const responses = useFormStore((s) => s.responses)
  const currentFormId = useFormStore((s) => s.formId)
  const currentTitle = useFormStore((s) => s.formTitle)
  const currentDescription = useFormStore((s) => s.formDescription)
  const currentFields = useFormStore((s) => s.fields)
  const createNewForm = useFormStore((s) => s.createNewForm)
  const loadForm = useFormStore((s) => s.loadForm)
  const setActiveView = useFormStore((s) => s.setActiveView)

  const forms = useMemo(() => {
    const list = Object.values(savedForms || {}).map((form) => ({
      id: form.id,
      title: form.title || 'Untitled Form',
      description: form.description || '',
      fields: form.fields || [],
      savedAt: form.savedAt,
      isDraft: false,
    }))

    const hasCurrentDraft =
      currentFields.length > 0 && !(savedForms || {})[currentFormId]
    if (hasCurrentDraft) {
      list.unshift({
        id: currentFormId,
        title: currentTitle || 'Untitled Form',
        description: currentDescription || '',
        fields: currentFields,
        savedAt: null,
        isDraft: true,
      })
    }

    return list.sort((a, b) => {
      if (a.isDraft) return -1
      if (b.isDraft) return 1
      return new Date(b.savedAt || 0) - new Date(a.savedAt || 0)
    })
  }, [
    savedForms,
    currentFormId,
    currentTitle,
    currentDescription,
    currentFields,
  ])

  const activity = useMemo(() => {
    const rows = []
    Object.entries(responses || {}).forEach(([formId, list]) => {
      const form = savedForms?.[formId]
      const title =
        form?.title ||
        (formId === currentFormId ? currentTitle : null) ||
        'Untitled Form'
      ;(list || []).forEach((response) => {
        rows.push({ ...response, formId, formTitle: title })
      })
    })
    return rows.sort(
      (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
    )
  }, [responses, savedForms, currentFormId, currentTitle])

  const weekly = useMemo(() => buildWeeklySeries(activity), [activity])
  const totalSubmissions = activity.length
  const thisWeek = weekly[weekly.length - 1]?.count || 0
  const lastWeek = weekly[weekly.length - 2]?.count || 0
  const weekDelta =
    lastWeek === 0
      ? thisWeek > 0
        ? 100
        : 0
      : Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
  const totalFields = forms.reduce((sum, f) => sum + f.fields.length, 0)
  const avgPerForm = forms.length
    ? (totalSubmissions / forms.length).toFixed(1)
    : '0.0'
  const maxWeekly = Math.max(...weekly.map((w) => w.count), 1)

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const handleNewForm = () => {
    createNewForm()
    setActiveView('editor')
  }

  const openForm = (id, view = 'editor') => {
    loadForm(id)
    setActiveView(view)
  }

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-28">
        {/* ── Page header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8"
        >
          <div>
            <p className="fh-eyebrow">Workspace overview</p>
            <h1 className="text-3xl sm:text-[34px] font-semibold mt-2 leading-none">
              Forms at a glance
            </h1>
            <p
              className="text-sm mt-2 max-w-xl"
              style={{ color: 'var(--text-secondary)' }}
            >
              Track how your forms are performing, review submissions, and pick
              up where you left off.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-2 rounded-full border"
              style={{
                color: 'var(--text-secondary)',
                borderColor: 'var(--border)',
                background: 'var(--surface)',
              }}
            >
              <LuClock size={13} style={{ color: 'var(--clay)' }} />
              {today}
            </span>

            <button
              type="button"
              onClick={handleNewForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-transform hover:-translate-y-px cursor-pointer"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-contrast)',
                boxShadow: 'var(--shadow-accent)',
              }}
            >
              <LuPlus size={15} />
              New form
            </button>
          </div>
        </motion.div>

        {/* ── KPI cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-5">
          <StatCard
            index={0}
            label="Forms in workspace"
            value={forms.length}
            icon={LuLayers}
            foot={`${totalFields} fields designed`}
          />
          <StatCard
            index={1}
            label="Total submissions"
            value={totalSubmissions}
            icon={LuInbox}
            foot={
              totalSubmissions === 0
                ? 'No responses captured yet'
                : `${avgPerForm} per form on average`
            }
          />
          <StatCard
            index={2}
            label="This week"
            value={thisWeek}
            icon={LuChartColumn}
            foot={
              <DeltaLabel delta={weekDelta} compare="vs last week" />
            }
            tone="clay"
          />
          <StatCard
            index={3}
            label="Active fields"
            value={totalFields}
            icon={LuFileText}
            foot={
              forms.length
                ? `Across ${forms.length} ${forms.length === 1 ? 'form' : 'forms'}`
                : 'Start a form to add fields'
            }
          />
        </div>

        {/* ── Chart + activity ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="fh-card lg:col-span-2 p-5 sm:p-6 flex flex-col"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="fh-eyebrow">Submission volume</p>
                <h2 className="text-lg font-semibold mt-1">Last 8 weeks</h2>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold tabular-nums leading-none">
                  {totalSubmissions}
                </p>
                <p
                  className="text-[11px] mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  responses
                </p>
              </div>
            </div>

            <div className="flex items-end gap-2 sm:gap-3 mt-6">
              {weekly.map((week, i) => {
                const isCurrent = i === weekly.length - 1
                const height =
                  week.count === 0
                    ? 3
                    : Math.max(10, Math.round((week.count / maxWeekly) * 100))
                return (
                  <div
                    key={week.label + i}
                    className="flex-1 flex flex-col items-center gap-1.5 group"
                  >
                    <span
                      className="text-[10px] font-semibold tabular-nums opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {week.count}
                    </span>
                    <div className="w-full h-32 flex items-end">
                      <div
                        title={`${week.label}: ${week.count} ${
                          week.count === 1 ? 'response' : 'responses'
                        }`}
                        className="w-full rounded-t-md transition-all duration-300 group-hover:opacity-80"
                        style={{
                          height: `${height}%`,
                          minHeight: 3,
                          background: isCurrent
                            ? 'var(--accent)'
                            : week.count > 0
                              ? 'color-mix(in srgb, var(--accent) 42%, transparent)'
                              : 'var(--surface-2)',
                          border: week.count
                            ? 'none'
                            : '1px solid var(--border)',
                        }}
                      />
                    </div>
                    <span
                      className="text-[9.5px] whitespace-nowrap"
                      style={{
                        color: isCurrent
                          ? 'var(--accent)'
                          : 'var(--text-muted)',
                        fontWeight: isCurrent ? 600 : 400,
                      }}
                    >
                      {isCurrent ? 'This wk' : week.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div
              className="flex items-center justify-between gap-3 mt-6 pt-4 border-t text-[11px]"
              style={{ borderColor: 'var(--border)' }}
            >
              <span
                className="flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
                Current week
              </span>
              {totalSubmissions === 0 ? (
                <span style={{ color: 'var(--text-muted)' }}>
                  Share a form to start collecting responses
                </span>
              ) : (
                <DeltaLabel delta={weekDelta} compare="week over week" />
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="fh-card p-5 sm:p-6 flex flex-col"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="fh-eyebrow">Live feed</p>
                <h2 className="text-lg font-semibold mt-1">Recent activity</h2>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--clay-soft)',
                  color: 'var(--clay)',
                }}
              >
                {activity.length} total
              </span>
            </div>

            {activity.length > 0 ? (
              <ul className="mt-4 flex-1 space-y-1">
                {activity.slice(0, 5).map((item) => (
                  <li key={`${item.formId}-${item.id}`}>
                    <button
                      type="button"
                      onClick={() => openForm(item.formId, 'responses')}
                      className="w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
                    >
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 font-display"
                        style={{
                          background: 'var(--accent-soft)',
                          color: 'var(--accent)',
                        }}
                      >
                        {initialsOf(item.formTitle)}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-semibold truncate">
                          New response
                        </span>
                        <span
                          className="block text-[11px] truncate"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {item.formTitle}
                        </span>
                      </span>
                      <span
                        className="text-[10px] whitespace-nowrap"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {timeAgo(item.submittedAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
                  style={{
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                  }}
                >
                  <LuInbox size={20} />
                </div>
                <p className="text-sm font-medium">Quiet in here</p>
                <p
                  className="text-[11px] mt-1 max-w-[190px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  New submissions will appear here as soon as respondents fill
                  out a form.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveView('responses')}
              className="mt-4 inline-flex items-center justify-between w-full px-3 py-2 rounded-xl border text-[11px] font-semibold transition-colors hover:border-[var(--accent)] cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              View current form responses
              <LuArrowRight size={13} />
            </button>
          </motion.section>
        </div>

        {/* ── Forms table ─────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fh-card overflow-hidden"
        >
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <div>
              <p className="fh-eyebrow">Your work</p>
              <h2 className="text-lg font-semibold mt-1">Forms</h2>
            </div>
            <button
              type="button"
              onClick={handleNewForm}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <LuPlus size={13} />
              Create form
            </button>
          </div>

          {forms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr
                    className="uppercase text-[9.5px] font-semibold tracking-[0.14em]"
                    style={{
                      background: 'var(--surface-2)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <th className="py-2.5 px-5 sm:px-6 font-semibold">Form</th>
                    <th className="py-2.5 px-4 font-semibold">Fields</th>
                    <th className="py-2.5 px-4 font-semibold">Responses</th>
                    <th className="py-2.5 px-4 font-semibold whitespace-nowrap">
                      Last updated
                    </th>
                    <th className="py-2.5 px-5 sm:px-6" />
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form) => {
                    const count = (responses[form.id] || []).length
                    return (
                      <tr
                        key={form.id}
                        onClick={() => openForm(form.id)}
                        className="border-t transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <td className="py-3.5 px-5 sm:px-6">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-semibold shrink-0"
                              style={{
                                background: 'var(--surface-2)',
                                color: 'var(--accent)',
                              }}
                            >
                              {initialsOf(form.title)}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold truncate max-w-[220px]">
                                  {form.title}
                                </span>
                                {form.isDraft && (
                                  <span
                                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                                    style={{
                                      background: 'var(--clay-soft)',
                                      color: 'var(--clay)',
                                    }}
                                  >
                                    Draft
                                  </span>
                                )}
                              </div>
                              <p
                                className="text-[10.5px] truncate max-w-[260px] mt-0.5"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {form.description || 'No description'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td
                          className="py-3.5 px-4 tabular-nums"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {form.fields.length}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold tabular-nums">
                            {count}
                          </span>
                        </td>
                        <td
                          className="py-3.5 px-4 whitespace-nowrap"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {form.savedAt
                            ? new Date(form.savedAt).toLocaleDateString(
                                undefined,
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )
                            : 'Unsaved changes'}
                        </td>
                        <td
                          className="py-3.5 px-5 sm:px-6"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openForm(form.id, 'responses')}
                              title="View responses"
                              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--accent-soft)] cursor-pointer"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <LuInbox size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openForm(form.id)}
                              title="Edit form"
                              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--accent-soft)] cursor-pointer"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <LuPenLine size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <div
                className="rounded-2xl border-2 border-dashed p-10 text-center"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                  }}
                >
                  <LuFileText size={22} />
                </div>
                <h3 className="text-base font-semibold">No forms yet</h3>
                <p
                  className="text-xs mt-1 mb-5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Build your first form and its responses will show up on this
                  dashboard.
                </p>
                <button
                  type="button"
                  onClick={handleNewForm}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--accent-contrast)',
                  }}
                >
                  <LuPlus size={14} />
                  Create your first form
                </button>
              </div>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}

function StatCard({ index, label, value, icon, foot, tone = 'accent' }) {
  const Icon = icon
  const toneColor = tone === 'clay' ? 'var(--clay)' : 'var(--accent)'
  const toneSoft = tone === 'clay' ? 'var(--clay-soft)' : 'var(--accent-soft)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.05 + index * 0.04,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="fh-card p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.12em] leading-snug"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </p>
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: toneSoft, color: toneColor }}
        >
          <Icon size={14} />
        </span>
      </div>
      <p className="text-[26px] sm:text-[28px] font-semibold leading-none mt-3 tabular-nums">
        {value}
      </p>
      <div
        className="text-[10.5px] mt-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {foot}
      </div>
    </motion.div>
  )
}

function DeltaLabel({ delta, compare }) {
  const positive = delta > 0
  const flat = delta === 0
  const color = flat
    ? 'var(--text-muted)'
    : positive
      ? 'var(--success)'
      : 'var(--danger)'
  const Icon = positive ? LuTrendingUp : LuTrendingDown

  return (
    <span className="inline-flex items-center gap-1" style={{ color }}>
      {!flat && <Icon size={11} />}
      <strong className="font-semibold">
        {positive ? '+' : ''}
        {delta}%
      </strong>
      <span style={{ color: 'var(--text-muted)' }}>{compare}</span>
    </span>
  )
}
