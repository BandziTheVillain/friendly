import { 
  differenceInSeconds, differenceInMinutes, 
  differenceInHours, differenceInDays, format 
} from 'date-fns';

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(n);
}

// date tools
export function formatDate(dateInput: string) : string {
  const postDate = new Date(dateInput);
  const now = new Date();

  const seconds = differenceInSeconds(now, postDate);
  const minutes = differenceInMinutes(now, postDate);
  const hours = differenceInHours(now, postDate);
  const days = differenceInDays(now, postDate);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return format(postDate, 'MMM d');
}