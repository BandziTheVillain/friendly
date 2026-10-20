import Sidebar from "./Sidebar";

export const Layout = ({ children }:{ children : React.ReactNode }) => {
    return (
        <div className="relative flex min-h-screen w-full bg-ink text-white">
            <Sidebar />
            <main className="relative mx-auto w-full max-w-5xl min-w-0 flex-1 animate-fade-up px-4 lg:px-8">
                {children}
            </main>
        </div>
    )
}
