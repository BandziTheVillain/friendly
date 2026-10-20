import React from 'react'
import { Layout } from './Layout'
import PeopleTabs from './PeopleTabs'

const Connect = ({ children } : { children: React.ReactNode }) => {
  return (
    <Layout>
        <div className="mx-auto max-w-2xl py-6">
            <div className="glass sticky top-0 z-10 mb-4 overflow-hidden rounded-2xl border border-line">
                <div className="px-5 pb-2 pt-4">
                    <h1 className="text-2xl font-extrabold">Connect</h1>
                </div>
                <PeopleTabs />
            </div>
            {children}
        </div>
    </Layout>
  )
}

export default Connect
