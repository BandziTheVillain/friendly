import Sidebar, { MobileNav } from "./Sidebar";

export const Layout = ({ children }:{ children : React.ReactNode }) => {
    return (
        <div className="relative flex min-h-screen w-full bg-ink text-white">
            <Sidebar />
            {/* pb-16 keeps content clear of the mobile tab bar */}
            <main className="relative mx-auto w-full max-w-5xl min-w-0 flex-1 animate-fade-up px-4 pb-16 md:pb-0 lg:px-8">
                {children}
            </main>
            <MobileNav />
        </div>
    )
}
