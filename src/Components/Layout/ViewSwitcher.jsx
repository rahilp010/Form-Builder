import { useFormStore } from '../../Store/formStore'
import { motion } from 'motion/react'
import {
  LuEye,
  LuInbox,
  LuLayoutDashboard,
  LuPenLine,
} from 'react-icons/lu'

const VIEWS = [
  { id: 'dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
  { id: 'editor', label: 'Editor', icon: LuPenLine },
  { id: 'preview', label: 'Preview', icon: LuEye },
  { id: 'responses', label: 'Responses', icon: LuInbox },
]

/**
 * iOS-style segmented control.
 * variant="inline" sits in the header; variant="dock" floats
 * bottom-center as a frosted dock (used on the dashboard).
 */
export default function ViewSwitcher({ variant = 'inline' }) {
  const activeView = useFormStore((s) => s.activeView)
  const setActiveView = useFormStore((s) => s.setActiveView)
  const isDock = variant === 'dock'

  const control = (
    <div
      role="tablist"
      aria-label="Workspace views"
      className={`flex items-center gap-0.5 rounded-full ${
        isDock ? 'view-dock p-1.5' : 'p-1 border'
      }`}
      style={
        isDock
          ? undefined
          : {
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
            }
      }
    >
      {VIEWS.map(({ id, label, icon }) => {
        const Icon = icon
        const isActive = activeView === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={label}
            title={label}
            onClick={() => setActiveView(id)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
            style={{
              color: isActive
                ? isDock
                  ? 'var(--accent-contrast)'
                  : 'var(--text-primary)'
                : 'var(--text-secondary)',
            }}
          >
            {isActive && (
              <motion.span
                layoutId={`view-switcher-active-${variant}`}
                transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: isDock
                    ? 'var(--accent)'
                    : 'var(--surface-active)',
                  border: isDock ? 'none' : '1px solid var(--border)',
                  boxShadow: isDock
                    ? 'var(--shadow-accent)'
                    : 'var(--shadow-soft)',
                }}
              />
            )}
            <Icon size={14} className="relative z-10 shrink-0" />
            <span className="relative z-10 hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )

  if (!isDock) return control

  return (
    <div className="fixed inset-x-0 bottom-5 sm:bottom-7 z-50 flex justify-center px-4 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="pointer-events-auto"
      >
        {control}
      </motion.div>
    </div>
  )
}
