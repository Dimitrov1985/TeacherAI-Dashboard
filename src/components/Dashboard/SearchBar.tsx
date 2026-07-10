import { IconSearch } from './icons'

export default function SearchBar() {
  return (
    <div
      className="flex w-full max-w-[442px] items-center gap-4 rounded-2xl px-4 py-2"
      style={{
        backgroundColor: 'var(--bg-surface-2)',
        border: '1px solid var(--border)',
      }}
    >
      <IconSearch
        className="h-5 w-5 flex-shrink-0"
        style={{ color: 'var(--text-secondary)' }}
      />
      <div
        className="h-6 w-px flex-shrink-0"
        style={{ backgroundColor: 'var(--border-strong)' }}
      />
      <input
        type="text"
        placeholder="Search..."
        className="w-full bg-transparent text-sm focus:outline-none"
        style={{
          color: 'var(--text-primary)',
        }}
      />
    </div>
  )
}
