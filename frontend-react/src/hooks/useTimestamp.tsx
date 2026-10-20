import { formatDate } from "@/lib/utils";
import { differenceInMinutes } from "date-fns";
import { useState, useEffect } from "react";

export function useTimestamp(date: string) {
  const [formatted, setFormatted] = useState(() => formatDate(date));

  useEffect(() => {
    setFormatted(formatDate(date));

    const minutes = differenceInMinutes(new Date(), new Date(date));
    const intervalTime = minutes < 60 ? 10000 : 300000;

    const timer = setInterval(() => {
      setFormatted(formatDate(date));
    }, intervalTime);

    return () => clearInterval(timer);
  }, [date]);

  return formatted;
}