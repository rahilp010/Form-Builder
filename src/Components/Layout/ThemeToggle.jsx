import { useFormStore } from '../../Store/formStore'
import { motion } from 'motion/react'
import { LuMoon, LuSun } from 'react-icons/lu'

export default function ThemeToggle() {
  const theme = useFormStore((s) => s.theme)
  const toggleTheme = useFormStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className="relative inline-flex items-center w-[58px] h-8 rounded-full border p-[3px] transition-colors cursor-pointer shrink-0"
      style={{
        background: 'var(--surface-2)',
        borderColor: 'var(--border)',
        justifyContent: isDark ? 'flex-end' : 'flex-start',
      }}
    >
      <span className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <LuSun
          size={11}
          style={{ color: isDark ? 'var(--text-muted)' : 'var(--clay)' }}
        />
        <LuMoon
          size={11}
          style={{ color: isDark ? 'var(--accent)' : 'var(--text-muted)' }}
        />
      </span>

      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 520, damping: 34 }}
        className="relative z-10 flex items-center justify-center w-[26px] h-[26px] rounded-full"
        style={{
          background: 'var(--surface)',
          color: isDark ? 'var(--accent)' : 'var(--clay)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        {isDark ? <LuMoon size={13} /> : <LuSun size={13} />}
      </motion.span>
    </button>
  )
}
