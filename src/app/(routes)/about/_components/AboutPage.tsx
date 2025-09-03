"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Github, Linkedin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface MainMenuData {
  aboutParagraph?: string;
  socialLinks?: string[];
  email?: string;
  mainLogo?: string; // ✅ API'den logo
}

const AboutPage = () => {
  const [data, setData] = useState<MainMenuData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/mainmenu", { cache: "no-store" });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("❌ About verisi alınamadı:", err);
      }
    };
    fetchData();
  }, []);

  const getSiteName = (url: string) => {
    try {
      const hostname = new URL(url).hostname.replace("www.", "");
      return hostname.split(".")[0];
    } catch {
      return url;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-3xl bg-card p-8 sm:p-10 rounded-2xl shadow-xl border border-border transition-all duration-300 hover:shadow-2xl">
        {/* Geri Tuşu */}
        <div className="flex items-center justify-start mb-6">
          <Button
            asChild
            variant="ghost"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sm:hidden">Geri</span>
            </Link>
          </Button>
        </div>

        {/* Büyük Logo */}
        {data?.mainLogo && (
          <div className="flex justify-center mb-8">
            <img
              src={data.mainLogo}
              alt="Logo"
              className="h-28 w-28 sm:h-36 sm:w-36 rounded-full object-cover shadow-lg border"
            />
          </div>
        )}

        {/* Başlık */}
        <h1 className="text-center text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-10">
          About
        </h1>

        {/* Hakkımda */}
        <section className="mb-10">
          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground whitespace-pre-line text-center">
            {data?.aboutParagraph || "Henüz içerik eklenmedi."}
          </p>
        </section>

        {/* İletişim */}
        <section>
          <h2 className="text-2xl font-bold mb-6 border-b pb-3 border-border">
            İletişim
          </h2>

          <div className="flex flex-col gap-6">
            {/* Email */}
            {data?.email && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <a
                  href={`mailto:${data.email}?subject=Merhaba&body=Size%20ulaşmak%20istiyorum`}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-5 w-5" /> Email
                </a>
              </Button>
            )}

            {data?.email && data?.socialLinks?.length ? (
              <Separator className="my-2" />
            ) : null}

            {/* Sosyal Medya */}
            <div className="flex flex-wrap gap-4">
              {data?.socialLinks?.map((link, idx) => {
                const hostname = getSiteName(link);
                const isGithub = hostname.includes("github");
                const isLinkedin = hostname.includes("linkedin");

                return (
                  <Button
                    key={idx}
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      {isGithub ? (
                        <>
                          <Github className="h-5 w-5" /> GitHub
                        </>
                      ) : isLinkedin ? (
                        <>
                          <Linkedin className="h-5 w-5" /> LinkedIn
                        </>
                      ) : (
                        <>
                          <Globe className="h-5 w-5" /> {hostname}
                        </>
                      )}
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
