import { redirect } from "next/navigation";

/**
 * /start is no longer a step in the flow.
 * Register → Assessment directly.
 * Keep this redirect so any old bookmarks or links don't 404.
 */
export default function StartPage() {
  redirect("/assessment");
}
