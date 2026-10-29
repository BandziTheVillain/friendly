import { useEffect, useState } from "react";
import { Camera, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { FRIENDS_QUERY_KEY, errorMessage } from "@/lib/friends";
import { useAuthStore } from "@/store/auth";

interface Props {
  profile: Profile;
  onClose: () => void;
}

export function EditProfileDialog({ profile, onClose }: Props) {
  const client = useQueryClient();
  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // previews for freshly picked files, revoked when replaced or on close
  const avatarPreview = usePreview(avatar) ?? profile.avatar;
  const coverPreview = usePreview(cover) ?? profile.cover_img;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("first_name", firstName.trim());
      fd.append("last_name", lastName.trim());
      fd.append("bio", bio.trim());
      if (avatar) fd.append("avatar", avatar);
      if (cover) fd.append("cover_img", cover);
      const res = await api.patch<Profile>(`/profiles/user/${profile.user}`, fd);

      // the sidebar and composer read the signed-in user from the store
      const { user, login } = useAuthStore.getState();
      if (user) {
        login({ ...user, first_name: res.data.first_name, last_name: res.data.last_name, avatar: res.data.avatar });
      }
      await Promise.all([
        client.invalidateQueries({ queryKey: [FRIENDS_QUERY_KEY] }),
        client.invalidateQueries({ queryKey: ["user-timeline"] }),
      ]);
      toast.success("Profile updated");
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => !saving && onClose()}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="card max-h-full w-full max-w-lg overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-bold">Edit profile</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cover + avatar pickers */}
        <label
          style={coverPreview ? { backgroundImage: `url('${coverPreview}')` } : undefined}
          className="group relative block h-32 cursor-pointer bg-surface-2 bg-cover bg-center"
        >
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-5 w-5" />
          </span>
        </label>
        <div className="-mt-10 px-5">
          <label className="group relative block h-20 w-20 cursor-pointer rounded-full">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatar(e.target.files?.[0] ?? null)} />
            <img src={avatarPreview} alt="" className="h-20 w-20 rounded-full border-4 border-ink object-cover" />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-5 w-5" />
            </span>
          </label>
        </div>

        <div className="space-y-3 p-5">
          <div className="flex gap-3">
            <input className="field" placeholder="First name" maxLength={150} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input className="field" placeholder="Last name" maxLength={150} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <textarea
            className="field resize-none"
            placeholder="Bio"
            rows={3}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={saving} className="btn-ghost px-5 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary px-5 py-2 text-sm">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function usePreview(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return setUrl(null);
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}
