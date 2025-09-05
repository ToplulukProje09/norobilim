"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Briefcase,
  Users,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  ArrowLeft,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Role {
  _id: string;
  title: string;
  organization: string;
  startDate?: string;
  endDate?: string;
}

interface Person {
  _id: string;
  name: string;
  class: string;
  department: string;
  photo?: string;
  roles: Role[];
  socialMedia?: Record<string, string>;
}

export default function ShowPerson({ persons = [] }: { persons?: Person[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterClass, setFilterClass] = useState("all");

  const departments = useMemo(
    () =>
      [...new Set(persons.map((p) => p.department))].filter(
        (dep) => dep && dep.trim() !== ""
      ),
    [persons]
  );
  const classes = useMemo(
    () =>
      [...new Set(persons.map((p) => p.class))].filter(
        (cls) => cls && cls.trim() !== ""
      ),
    [persons]
  );

  const filteredPersons = useMemo(() => {
    return persons.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.roles.some(
          (role) =>
            role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            role.organization.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesDepartment =
        filterDepartment === "all" || p.department === filterDepartment;
      const matchesClass = filterClass === "all" || p.class === filterClass;

      return matchesSearch && matchesDepartment && matchesClass;
    });
  }, [persons, searchQuery, filterDepartment, filterClass]);

  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-5 w-5" />;
      case "twitter":
        return <Twitter className="h-5 w-5" />;
      case "linkedin":
        return <Linkedin className="h-5 w-5" />;
      case "github":
        return <Github className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const formatRoleDates = (startDate?: string, endDate?: string) => {
    const start = startDate
      ? new Date(startDate).toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Belirtilmemiş";
    const end = endDate
      ? new Date(endDate).toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Devam Ediyor";
    return `${start} - ${end}`;
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-background text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-full transition-colors duration-300 hover:bg-muted dark:hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Geri dön"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-center sm:text-left md:text-4xl">
            Ekibimiz ✨
          </h1>
        </div>
      </div>
      <Separator className="mb-8" />
      <div className="mb-8 flex flex-col md:flex-row items-center md:justify-center gap-4">
        <div className="relative w-full md:w-1/2">
          <Input
            type="text"
            placeholder="Ada veya bölüme göre ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>
        <Select onValueChange={setFilterClass} value={filterClass}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sınıfı Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Sınıflar</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setFilterDepartment} value={filterDepartment}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Bölümü Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Bölümler</SelectItem>
            {departments.map((dep) => (
              <SelectItem key={dep} value={dep}>
                {dep}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPersons.length > 0 ? (
          filteredPersons.map((p) => (
            <Card
              key={p._id}
              className="flex flex-col h-full overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl border border-gray-200 dark:border-gray-800"
            >
              <CardHeader className="flex flex-col items-center p-4 pb-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-primary/20 mb-3 flex items-center justify-center bg-gray-100 dark:bg-gray-800 group cursor-pointer transition-transform duration-300 hover:scale-105">
                      {p.photo && p.photo.trim() !== "" ? (
                        <Image
                          src={p.photo}
                          alt={p.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={true}
                          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-125"
                        />
                      ) : (
                        <Users className="w-20 h-20 text-gray-400 dark:text-gray-600" />
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="p-0 bg-transparent border-0 shadow-none">
                    <VisuallyHidden>
                      <DialogTitle>{p.name} fotoğraf</DialogTitle>
                    </VisuallyHidden>
                    <div className="relative w-full h-[80vh] flex items-center justify-center">
                      {p.photo && (
                        <Image
                          src={p.photo}
                          alt={p.name}
                          fill
                          className="object-contain rounded-lg"
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="text-center w-full">
                  <CardTitle className="line-clamp-2 text-xl font-bold">
                    {p.name}
                  </CardTitle>
                  <CardDescription className="flex flex-col items-center justify-center space-y-1 mt-1 text-center">
                    <Badge
                      variant="secondary"
                      className="text-xs dark:bg-zinc-700 dark:text-zinc-200"
                    >
                      <Briefcase className="h-3 w-3 mr-1" />
                      {p.department}
                    </Badge>
                    <Badge className="text-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md dark:bg-purple-800 dark:hover:bg-purple-900">
                      <Users className="h-4 w-4 mr-1" />
                      Sınıf: {p.class}
                    </Badge>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-lg text-primary dark:text-primary-foreground">
                    Roller
                  </h4>
                </div>
                <div className="flex flex-col gap-3">
                  {p.roles && p.roles.length > 0 ? (
                    p.roles.map((r, index) => (
                      <div
                        key={index}
                        className="flex flex-col p-3 border rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors duration-200 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="default"
                            className="text-lg font-bold text-primary-foreground bg-primary/80 hover:bg-primary dark:bg-primary/60 dark:hover:bg-primary/80"
                          >
                            {r.title}
                          </Badge>
                        </div>
                        <span className="text-xs font-medium text-foreground opacity-80 dark:text-gray-400">
                          {r.organization}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground flex items-center mt-1 dark:text-gray-400">
                                <CalendarDays className="h-3 w-3 mr-1" />
                                {formatRoleDates(r.startDate, r.endDate)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">
                                Başlangıç:{" "}
                                {r.startDate
                                  ? new Date(r.startDate).toLocaleDateString(
                                      "tr-TR"
                                    )
                                  : "Belirtilmemiş"}
                              </p>
                              <p className="text-sm">
                                Bitiş:{" "}
                                {r.endDate
                                  ? new Date(r.endDate).toLocaleDateString(
                                      "tr-TR"
                                    )
                                  : "Devam Ediyor"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center p-3 rounded-md border-2 border-dashed text-muted-foreground/70 text-center dark:border-gray-700 dark:text-gray-500">
                      <span className="text-sm">Hiç rol atanmamış.</span>
                    </div>
                  )}
                </div>
                {p.socialMedia && Object.keys(p.socialMedia).length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    {Object.keys(p.socialMedia).map((platform) => {
                      const IconComponent = getIcon(platform);
                      if (!IconComponent) return null;
                      const url = p.socialMedia?.[platform];
                      if (!url) return null;
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-2 rounded-full text-white transition-colors duration-200 shadow-sm hover:shadow-md"
                          style={{
                            backgroundColor:
                              platform.toLowerCase() === "instagram"
                                ? "#E1306C"
                                : platform.toLowerCase() === "twitter"
                                ? "#1DA1F2"
                                : platform.toLowerCase() === "linkedin"
                                ? "#0A66C2"
                                : platform.toLowerCase() === "github"
                                ? "#333"
                                : "#6b7280",
                          }}
                        >
                          {IconComponent}
                        </a>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <h3 className="text-2xl font-bold text-muted-foreground">
              😔 Üzgünüz,
            </h3>
            <p className="text-xl text-muted-foreground">
              Arama kriterlerinize uygun kişi bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
