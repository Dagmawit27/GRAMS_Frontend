import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full relative bottom-0 left-0 z-50 bg-black/40 backdrop-blur-sm border-t border-white/10 py-3 px-0 mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-300 px-4">
        <Link href="/" className="text-green-400 font-semibold tracking-widest uppercase text-xs drop-shadow">
          Rental System
        </Link>
        <p className="text-xs text-gray-400">
          Ministry of Urban Development &amp; Construction &nbsp;|&nbsp; Addis Ababa, Ethiopia
        </p>
        <p className="text-xs">© {new Date().getFullYear()} Rental System. All rights reserved.</p>
      </div>
    </footer>
  );
}
