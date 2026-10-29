import { HeadContent, Outlet, createRootRoute } from '@tanstack/react-router'

import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { ToastContainer } from 'react-toastify'

import { seo } from '@/lib/seo'

import '../styles.css'

export const Route = createRootRoute({
  head: () => seo(),
  component: RootComponent,
})

function RootComponent() {
  return (
    <div>
      <HeadContent />
      <ToastContainer />
      <Outlet />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </div>
  )
}
