"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ModeToggle } from "@/components/ModeToggle";

interface MainMenu {
  id: string;
  titlePrimary: string;
  titleSecondary: string;
  mainLogo: string;
  mainPhoto?: string | null;
  aboutParagraph?: string | null;
  mainParagraph?: string | null;
  socialLinks?: string[];
  email?: string | null;
}

const links = [
  { href: "/", label: "Bloglar" },
  { href: "/persons", label: "Persons" },
  { href: "/eventslist", label: "Events" },
  { href: "/podcasts", label: "Podcast" },
  { href: "/academics", label: "Akademi" },
  // { href: "/about", label: "Hakkımızda" }, // ⬅️ kaldırıldı
];

const MobileMenu = ({ mainMenu }: { mainMenu: MainMenu | null }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Menüyü aç"
          className="rounded-full shadow-lg transition-all duration-300
          bg-slate-50 dark:bg-gray-800 text-gray-900 dark:text-white
          hover:bg-slate-200 dark:hover:bg-gray-700
          hover:shadow-xl hover:scale-105 active:scale-90"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-full sm:w-[350px] bg-background dark:bg-gray-950/90 backdrop-blur-xl transition-colors duration-300 border-r-2 dark:border-r-slate-800 p-8"
      >
        <SheetHeader className="mb-10 text-center">
          <SheetTitle className="text-4xl font-extrabold tracking-wide text-gray-900 dark:text-white">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
            >
              {mainMenu?.mainLogo ? (
                <img
                  src={mainMenu.mainLogo}
                  alt="Site Logosu"
                  className="h-12 w-auto mx-auto"
                />
              ) : (
                <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {mainMenu?.titlePrimary || "MyLogo"}
                </span>
              )}
            </Link>
          </SheetTitle>
          <SheetDescription className="text-lg text-gray-500 dark:text-gray-400">
            Menüden istediğiniz sayfaya geçiş yapın.
          </SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col items-center justify-center gap-6 font-semibold">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="group relative w-full text-center py-4 px-6 rounded-xl transition-all duration-300
              text-xl text-gray-700 dark:text-gray-300
              hover:text-blue-600 dark:hover:text-blue-400"
            >
              <span className="absolute inset-0 z-0 bg-gray-100 dark:bg-gray-800 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:shadow-lg"></span>

              <span className="relative z-10 transition-all duration-300 group-hover:font-extrabold">
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-10 flex justify-center">
          <ModeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
