import { Layout } from '@/components/Layout'
import { createFileRoute } from '@tanstack/react-router'
import { Compass, Search } from 'lucide-react'

export const Route = createFileRoute('/_protected/discover')({
  component: Page,
})

function Page() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl py-6">
        <div className="page-header mb-4 rounded-2xl border border-line">
          <h1 className="text-2xl font-extrabold">Discover</h1>
          <p className="text-sm text-white/45">See who else is hanging out here</p>
        </div>

        <label className="flex items-center gap-3 rounded-full border border-line bg-surface-2 px-5 py-3.5 transition focus-within:border-white/30">
          <Search className="h-5 w-5 shrink-0 text-white/40" />
          <input
            type="search"
            placeholder="Search for users…"
            className="w-full bg-transparent text-[15px] text-white placeholder:text-white/35 focus:outline-none"
          />
        </label>

        <div className="card mt-6 flex flex-col items-center gap-2 px-6 py-16 text-center">
          <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet/15">
            <Compass className="h-6 w-6 text-violet" />
          </span>
          <p className="font-bold">Go on, have a look around</p>
          <p className="max-w-sm text-sm text-white/45">Search by name or username to find someone.</p>
        </div>
      </div>
    </Layout>
  )
}
