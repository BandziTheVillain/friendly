import { Link } from '@tanstack/react-router'

export const FriendRequestSidebar = () => {
    return (
        <div className="p-3 w-80 flex flex-col rounded-xl shadow border border-white/5 bg-[#0D0D11] h-80 overflow-scroll">
            <h1 className="text-xl font-black">Friend requests</h1>
            <div className="flex-1">
            {/* {users.map((user) => <SuggestedUserCard key={user.id} user={user} />)} */}
            </div>
            <Link to="." className="w-full text-center bg-white text-black font-bold flex items-center justify-center p-2 rounded-3xl mt-2 hover:opacity-80">See all suggested friends</Link>
        </div>
    )
}
