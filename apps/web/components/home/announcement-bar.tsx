import Link from "next/link";
import { announcement } from "@/lib/data/homepage";

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-center text-sm text-white">
      <Link
        href={announcement.href}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 transition-opacity hover:opacity-90"
      >
        <span aria-hidden>🎉</span>
        <span>{announcement.text}</span>
        <span className="font-medium underline underline-offset-2">Shop now</span>
      </Link>
    </div>
  );
}
