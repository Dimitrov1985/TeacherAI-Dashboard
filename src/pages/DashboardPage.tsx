import SearchBar from '../components/Dashboard/SearchBar'
import StatsBar from '../components/Dashboard/StatsBar'
import WeeklySchedule from '../components/Dashboard/WeeklySchedule'

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 overflow-y-auto bg-white px-4 py-8 sm:px-10 lg:px-16">
      <div className="flex w-full flex-col items-center gap-8">
        <SearchBar />
        <StatsBar />
      </div>
      <WeeklySchedule />
    </main>
  )
}
