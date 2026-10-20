interface User {
  id: number | string;
  first_name: string;
  last_name: string;
  username: string;
  avatar: string;
  /** present on people lists (suggested, friends) */
  friends_count?: number;
  relationship?: Relationship;
}

type Relationship = "self" | "friends" | "request_sent" | "request_received" | "none";

interface APIResponse<T> {
  count: number;
  results: Array<T>;
  previous: string | null;
  next: string | null;
}

interface Post {
  id: string;
  author: User;
  date_created: string;
  text: string;
  like_count: number;
  comment_count: number;
  image: string | null; // tailwind gradient classes, e.g. "from-[#FF3D77] to-[#7C5CFF]"
}

interface Like {
  id: string;
  user: User;
  post: string;
}

interface IComment {
  id: string;
  user: User
  text: string;
  date_created: string;
  post: string;
}

interface Profile {
  id: string;
  /** the owner's user id */
  user: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
  cover_img: string | null;
  bio: string | null;
  date_joined: string;
  friends_count: number;
  /** the viewer's relationship to this profile's owner */
  relationship: Relationship;
  /** the pending request between the viewer and the owner, either direction */
  friend_request_id: string | null;
}

interface FriendRequest {
  id: string;
  sender: User;
  recepient: User;
  date_created: string;
  status: "Pending" | "Accepted" | "Declined";
}

// interface Post {
//   id: string;
//   name: string;
//   handle: string;
//   avatar: string;
//   date_created: string;
//   text: string;
//   image: string | null; // tailwind gradient classes, e.g. "from-[#FF3D77] to-[#7C5CFF]"
//   likes: number;
//   comments: number;
//   reposts: number;
//   liked?: boolean;
//   reposted?: boolean;
// }