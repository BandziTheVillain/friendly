import { api } from "./api"
import { FRIENDS_QUERY_KEY } from "./friends"

// keyed under FRIENDS_QUERY_KEY so friend actions anywhere refresh the button and count
export const profileKey = (username: string) => [FRIENDS_QUERY_KEY, "profile", username]

export const friendListKey = (username: string) => [FRIENDS_QUERY_KEY, "list", username]

export const getUserProfile = async (username: string): Promise<Profile> => {
	const res = await api.get(`/profiles/${username}/`)
	return res.data
}

export const getFriendList = async (username: string, page: number): Promise<APIResponse<User>> => {
	const res = await api.get(`/users/${username}/friends/`, { params: { page } })
	return res.data
}

export const displayName = (user: { first_name: string; last_name: string; username: string }) =>
	`${user.first_name} ${user.last_name}`.trim() || user.username
