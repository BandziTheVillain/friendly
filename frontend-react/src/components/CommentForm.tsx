import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query';
import { SendHorizontal } from 'lucide-react';
import React from 'react'
import { toast } from 'react-toastify';

interface Props {
  postID: string;
  queryKey?: string;
}

export const CommentForm = ({ postID, queryKey }: Props) => {
    const { user } = useAuthStore.getState();

    const client = useQueryClient();

    const form = useForm({
      defaultValues: {
        text: "",
        post: postID
      },
      onSubmit: async ({ value, formApi }) => {
        try {
          await api.post("/comments/", value);
        } catch(err: any) {
          toast.error("Something went wrong");
          throw new Error(err);
        } finally {
          formApi.reset();
          client.invalidateQueries({ queryKey: [queryKey || `comments-${postID}` || "user-timeline"] })
        }
      }
    });

    const onSubmit = (e: React.SubmitEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit()
    }

    return (
    <form className='flex items-center gap-2.5' onSubmit={onSubmit}>
        <img src={user?.avatar} className='h-8 w-8 shrink-0 rounded-full object-cover' alt="" />
        <div className="flex flex-1 items-center rounded-full border border-line bg-surface-2 pl-4 pr-1 transition focus-within:border-white/30">
            <form.Field
            name="text">
            {(field) => (
                <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Write a comment…"
                type='text'
                className="w-full bg-transparent py-2 text-sm text-white placeholder:text-white/35 focus:outline-none"
                />
            )}
            </form.Field>
            <form.Subscribe selector={(state) => state.values.text}>
              {(text) => (
                <button
                  className="shrink-0 rounded-full p-1.5 text-white/40 transition-colors enabled:text-flame enabled:hover:bg-flame/10 disabled:cursor-not-allowed"
                  disabled={!text.trim()}
                  aria-label="Send comment"
                >
                  <SendHorizontal className="h-4.5 w-4.5" />
                </button>
              )}
            </form.Subscribe>
        </div>
    </form>
    )
}
