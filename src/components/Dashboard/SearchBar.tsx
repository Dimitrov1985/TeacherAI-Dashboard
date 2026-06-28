import { IconSearch } from './icons'

export default function SearchBar() {
  return (
    <div className="flex w-full max-w-[442px] items-center gap-4 rounded-2xl bg-[#DCE8F5] px-4 py-2">
      <IconSearch className="h-5 w-5 flex-shrink-0 text-[#457B9D]" />
      <div className="h-6 w-px flex-shrink-0 bg-[#457B9D]" />
      <input
        type="text"
        placeholder="Search..."
        className="w-full bg-transparent text-sm text-[#457B9D] placeholder:text-[#457B9D]/60 focus:outline-none"
      />
    </div>
  )
}
