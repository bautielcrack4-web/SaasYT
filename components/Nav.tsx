"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/create-channel", label: "Crear Canal" },
  { href: "/history", label: "Historial" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="bg-surface/60 border-b border-white/20 sticky top-0 z-50 backdrop-blur-[40px]">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto h-20">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="font-display text-title-md font-black text-primary tracking-tighter"
          >
            CreatorLens
          </Link>
          <div className="hidden md:flex gap-8">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    active
                      ? "font-display text-body-md font-semibold text-primary border-b-2 border-primary pb-1"
                      : "font-display text-body-md font-medium text-on-surface-variant hover:text-primary smooth-transition"
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <button className="bg-primary text-on-primary px-5 md:px-7 py-2.5 rounded-full font-bold hover:brightness-110 active:scale-95 smooth-transition text-body-md shadow-lg shadow-primary/20">
            Upgrade
          </button>
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20">
            <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-high flex items-center justify-center text-primary">
              <Icon name="person" size={22} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
