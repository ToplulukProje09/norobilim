"use client";

import { Instagram, Linkedin, Twitter, Facebook, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";

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

// Header ile aynı linkler
const links = [
  { href: "/", label: "Bloglar" },
  { href: "/persons", label: "Persons" },
  { href: "/eventslist", label: "Events" },
  { href: "/podcasts", label: "Podcast" },
  { href: "/academics", label: "Akademi" },
  { href: "/about", label: "Hakkımızda" },
];

const getSocialIcon = (link: string) => {
  if (link.includes("instagram.com")) return <Instagram className="h-6 w-6" />;
  if (link.includes("linkedin.com")) return <Linkedin className="h-6 w-6" />;
  if (link.includes("twitter.com")) return <Twitter className="h-6 w-6" />;
  if (link.includes("facebook.com")) return <Facebook className="h-6 w-6" />;
  return null;
};

const getSocialHoverColor = (link: string) => {
  if (link.includes("instagram.com")) return "hover:text-pink-600";
  if (link.includes("linkedin.com")) return "hover:text-blue-700";
  if (link.includes("twitter.com")) return "hover:text-blue-500";
  if (link.includes("facebook.com")) return "hover:text-blue-600";
  return "";
};

const Footer = () => {
  const [mainMenu, setMainMenu] = useState<MainMenu | null>(null);

  useEffect(() => {
    const fetchMainMenu = async () => {
      try {
        const response = await fetch("/api/mainmenu");
        if (!response.ok) throw new Error("Menü verileri çekilemedi.");
        const data: MainMenu = await response.json();
        setMainMenu(data);
      } catch (error) {
        console.error("Hata:", error);
      }
    };
    fetchMainMenu();
  }, []);

  return (
    <footer className="w-full bg-slate-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 py-12 px-4 md:px-6 shadow-inner mt-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-8 md:flex-row">
        {/* Logo & Telif */}
        <div className="order-last text-center md:order-first md:text-left">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {mainMenu?.titleSecondary || "Firma Adı"}
          </Link>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Tüm Hakları Saklıdır.
          </p>
        </div>

        {/* Menü Linkleri */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 transform hover:scale-105"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Sosyal Medya */}
        <div className="flex gap-4">
          {mainMenu?.socialLinks?.map((link, index) => {
            const icon = getSocialIcon(link);
            const hoverColor = getSocialHoverColor(link);
            if (!icon) return null;

            return (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.split(".")[1]}
                className={`text-gray-500 dark:text-gray-400 ${hoverColor} transition-colors duration-300 transform hover:-translate-y-1`}
              >
                {icon}
              </a>
            );
          })}

          {mainMenu?.email && (
            <a
              href={`mailto:${mainMenu.email}`}
              aria-label="Email"
              className="text-gray-500 dark:text-gray-400 hover:text-teal-500 transition-colors duration-300 transform hover:-translate-y-1"
            >
              <Mail className="h-6 w-6" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
