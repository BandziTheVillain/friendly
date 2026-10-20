import React from 'react'
import { Image as ImageIcon, X } from "lucide-react";
import { useAuthStore } from '@/store/auth';
import { useForm } from '@tanstack/react-form';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

interface FValue {
  text: string;
  image: File | null;
}

export function Compose():React.JSX.Element {
    const { user } = useAuthStore.getState();

    const defaultValues: FValue = {
      text: "",
      image: null
    };

    const client = useQueryClient();

    const form = useForm({
      defaultValues,
      onSubmit: async ({ value, formApi }) => {
        try {
          const fd = new FormData();
          fd.append("text", value.text);
          if (value.image) fd.append("image", value.image);
          await api.post("/posts/", fd);
        } catch(err: any) {
          toast.error("Something went wrong");
          throw new Error(err);
        } finally {
          formApi.reset();
          client.invalidateQueries({ queryKey: ["user-timeline"] })
        }
      }
    });

    const onSubmit = (e: React.SubmitEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit()
    }

    return (
        <form onSubmit={onSubmit} className="card mb-4 flex gap-3 p-4 transition focus-within:border-white/20">
        <img
          src={user?.avatar ?? "https://i.pravatar.cc/44?img=12"}
          alt="Your avatar"
          className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white/10"
        />
        <div className="flex-1">
          <form.Field
          name="text">
            {(field) => (
              <textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={`What's up, ${user?.first_name || user?.username}?`}
                rows={2}
                className="w-full resize-none border-none bg-transparent pt-2 text-[15px] text-white placeholder:text-white/40 focus:outline-none"
              />
            )}
          </form.Field>
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-3">
            <form.Field
            name='image'
            >
              {(field) => (
                <div className="flex min-w-0 items-center gap-2">
                  <input type='file' id='image' accept="image/*" className='hidden' onChange={(e) => e.target.files && field.handleChange(e.target.files[0])} />
                  <button
                    type='button'
                    onClick={() => document.getElementById("image")?.click()}
                    className="rounded-full p-2 text-white/50 transition-colors hover:bg-sky/10 hover:text-sky"
                    aria-label="Attach image"
                  >
                    <ImageIcon className="h-4.5 w-4.5" />
                  </button>
                  {field.state.value && (
                    <span className="flex min-w-0 items-center gap-1.5 rounded-full bg-white/5 py-1 pl-3 pr-1 text-xs text-white/70">
                      <span className="truncate">{field.state.value.name}</span>
                      <button
                        type="button"
                        onClick={() => field.handleChange(null)}
                        className="rounded-full p-0.5 hover:bg-white/10"
                        aria-label="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
              {([canSubmit, isSubmitting]) => (
                  <button
                    className="btn-primary px-5 py-1.5 text-sm"
                    disabled={isSubmitting || !canSubmit}
                  >
                    {isSubmitting ? "Posting…" : "Post"}
                  </button>
              )}
              </form.Subscribe>
          </div>
        </div>
      </form>
    )
}
