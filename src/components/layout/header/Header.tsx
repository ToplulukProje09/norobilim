"use client";

import { User, Info } from "lucide-react"; // ⬅️ Info ikonunu ekledim
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

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
  // { href: "/about", label: "Hakkımızda" }, // ⬅️ artık menüden kaldırıyoruz
];

const Header = () => {
  const [mainMenu, setMainMenu] = useState<MainMenu | null>(null);

  useEffect(() => {
    const fetchMainMenu = async () => {
      try {
        const response = await fetch("/api/mainmenu");
        if (!response.ok) {
          throw new Error("Menü verileri çekilemedi.");
        }
        const data: MainMenu = await response.json();
        setMainMenu(data);
      } catch (error) {
        console.error("Hata:", error);
      }
    };
    fetchMainMenu();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          {mainMenu?.mainLogo ? (
            <img
              src={mainMenu.mainLogo}
              alt="Site Logosu"
              className="h-8 w-auto"
            />
          ) : (
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300">
              MyLogo
            </span>
          )}
        </Link>

        {/* Desktop Menü */}
        <nav className="hidden md:flex items-center gap-8 font-semibold">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-blue-500 dark:after:bg-blue-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Sağ alan */}
        <div className="flex items-center gap-3">
          {/* Mobil Menü */}
          <div className="md:hidden flex items-center">
            <MobileMenu mainMenu={mainMenu} />
          </div>

          {/* Dark Mode Toggle */}
          <ModeToggle />

          {/* Hakkımızda İkonu */}
          <Link
            href="/about"
            className="p-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Hakkımızda"
          >
            <Info className="h-6 w-6 text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
