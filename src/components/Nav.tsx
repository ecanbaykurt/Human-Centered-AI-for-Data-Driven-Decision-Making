import Link from "next/link";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 h-[72px] border-b border-border/70 bg-[rgba(248,248,253,0.94)] backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1450px] items-center justify-between px-[5%]">
        <Link href="/" className="group flex items-start gap-3 no-underline">
          <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[8px] border border-purple text-[15px] font-bold text-purple transition-colors group-hover:bg-soft-purple">
            ⌘
          </span>
          <span className="leading-none">
            <span className="block text-[15px] font-extrabold tracking-[-0.02em] text-ink">
              Decision Lab
            </span>
            <span className="mt-1 block font-mono text-[10px] font-bold tracking-[0.14em] text-purple">
              HUMAN CENTERED AI
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/guide"
            className="hidden text-[13px] font-bold text-purple no-underline hover:opacity-75 sm:inline"
          >
            Smart guide
          </Link>
          <Link
            href="/settings"
            className="hidden text-[13px] font-bold text-muted no-underline hover:text-purple md:inline"
          >
            API key
          </Link>
          <Link
            href="/#how"
            className="hidden rounded-full border border-border bg-surface px-[18px] py-[11px] text-[13px] font-bold text-ink no-underline transition-colors hover:border-purple/30 hover:bg-soft-purple lg:inline-flex"
          >
            How it works
          </Link>
          <Link href="#explore" className="btn-primary text-[13px]">
            Explore templates ↗
          </Link>
        </div>
      </div>
    </nav>
  );
}
