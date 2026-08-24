import Link from "next/link";

interface AnnouncementBarProps {
  text: string;
  href: string;
}

export function AnnouncementBar({ text, href }: AnnouncementBarProps) {
  if (!text) return null;

  return (
    <div className="bg-primary text-center text-sm text-white">
      <Link
        href={href}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 transition-opacity hover:opacity-90"
      >
        <span aria-hidden>🎉</span>
        <span>{text}</span>
        <span className="font-medium underline underline-offset-2">Shop now</span>
      </Link>
    </div>
  );
}
