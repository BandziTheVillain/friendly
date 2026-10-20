import Connect from '@/components/Connect'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/connect/suggested-friends')({
  component: Page,
})

function Page() {
  return (
    <Connect>
      <h4 className='font-light'>Suggested</h4>
    </Connect>
  )
}