import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";

interface InstagramPost {
  id: string;
  alt: string;
  gradient: string;
}

interface InstagramSectionProps {
  posts: InstagramPost[];
}

export function InstagramSection({ posts }: InstagramSectionProps) {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Follow Us"
          subtitle="@imtiazmart on Instagram"
          href="https://instagram.com"
          linkLabel="Follow"
        />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`aspect-square rounded-lg bg-gradient-to-br ${post.gradient} transition-opacity hover:opacity-90`}
              aria-label={post.alt}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
