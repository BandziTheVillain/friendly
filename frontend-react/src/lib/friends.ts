import { isAxiosError } from "axios"
import { api } from "./api"

export type RequestBox = "incoming" | "outgoing"

/** Every query that depends on friendship state starts with this key, so one invalidate refreshes them all. */
export const FRIENDS_QUERY_KEY = "friends"

export const friendRequestsKey = (box: RequestBox) => [FRIENDS_QUERY_KEY, "requests", box]

export const incomingCountKey = [FRIENDS_QUERY_KEY, "incoming-count"]

export const getIncomingRequestCount = async (): Promise<number> => {
	const res = await api.get<APIResponse<FriendRequest>>("/friend-requests/", { params: { box: "incoming", page_size: 1 } })
	return res.data.count
}

export const getFriendRequests = async (box: RequestBox): Promise<APIResponse<FriendRequest>> => {
	const res = await api.get("/friend-requests/", { params: { box, page_size: 30 } })
	return res.data
}

/** Resolves to the new relationship: "friends" if they had already sent us a request, else "request_sent". */
export const sendFriendRequest = async (username: string): Promise<Relationship> => {
	const res = await api.post<FriendRequest>("/friend-requests/", { recipient: username })
	return res.data.status === "Accepted" ? "friends" : "request_sent"
}

export const acceptFriendRequest = (id: string) => api.post(`/friend-requests/${id}/accept/`)

export const declineFriendRequest = (id: string) => api.post(`/friend-requests/${id}/decline/`)

export const cancelFriendRequest = (id: string) => api.delete(`/friend-requests/${id}/`)

export const unfriend = (userId: string | number) => api.delete(`/friends/${userId}/`)

export const errorMessage = (err: unknown) =>
	(isAxiosError(err) && err.response?.data?.detail) || "Something went wrong"
