"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-700 shadow-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-tight text-sky-900">Shory</span>
            <span className="text-[11px] font-medium leading-tight text-sky-600 hidden sm:block">Insurance Comparator</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer",
              pathname === "/"
                ? "bg-sky-50 text-sky-700"
                : "text-slate-500 hover:bg-sky-50/60 hover:text-sky-700"
            )}
          >
            Dashboard
          </Link>
          <Link href="/requests/new">
            <Button size="sm" className="ml-2 bg-sky-700 hover:bg-sky-800 shadow-sm cursor-pointer">
              <Plus className="h-4 w-4 mr-1.5" />
              New Request
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
