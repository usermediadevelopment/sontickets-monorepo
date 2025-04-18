import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getEnabledValueForEnv = () => {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (env === "preview") {
    return "false";
  } else {
    return "true";
  }
};

export const getPreviewValueForQuery = (preview = "") => {
  let query = "enabled == true";

  if (preview == "showDisabled") {
    query = "enabled == false";
  } else if (preview == "showBoth") {
    query = "enabled in [true, false]";
  }
  return query;
};
