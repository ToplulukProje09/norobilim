"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Eraser, ArrowLeft } from "lucide-react";
import {
  Search,
  Calendar,
  Tag,
  Link2,
  File,
  Globe,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

// Export the Academic interface so it can be used elsewhere
export interface Academic {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  tags?: string[];
  links?: string[];
  files?: string[];
  createdAt: string;
}

interface UserAcademicListProps {
  initialAcademics: Academic[];
}

const UserAcademicList = ({ initialAcademics }: UserAcademicListProps) => {
  const [academics] = useState<Academic[]>(initialAcademics);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mediaFilter, setMediaFilter] = useState<
    "all" | "both" | "links" | "files" | "none"
  >("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const router = useRouter();

  const clearFilters = () => {
    setSearchQuery("");
    setMediaFilter("all");
    setTagFilter("all");
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    academics.forEach((academic) => {
      if (Array.isArray(academic.tags)) {
        academic.tags.forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [academics]);

  // Sadece yayınlanmış akademik kayıtları filtrele
  const publishedAcademics = useMemo(() => {
    return academics.filter((academic) => academic.published);
  }, [academics]);

  const filteredAcademics = useMemo(() => {
    return publishedAcademics.filter((academic) => {
      const matchesSearch =
        (academic.title &&
          academic.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        academic.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (Array.isArray(academic.tags) &&
          academic.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      const hasLinks = academic.links && academic.links.length > 0;
      const hasFiles = academic.files && academic.files.length > 0;
      const matchesMedia =
        mediaFilter === "all" ||
        (mediaFilter === "both" && hasLinks && hasFiles) ||
        (mediaFilter === "links" && hasLinks && !hasFiles) ||
        (mediaFilter === "files" && hasFiles && !hasLinks) ||
        (mediaFilter === "none" && !hasLinks && !hasFiles);

      const matchesTag =
        tagFilter === "all" ||
        (Array.isArray(academic.tags) && academic.tags.includes(tagFilter));

      return matchesSearch && matchesMedia && matchesTag;
    });
  }, [publishedAcademics, searchQuery, mediaFilter, tagFilter]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Akademik Kayıtlar
        </h1>
        <Button onClick={() => router.back()} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-grow md:w-1/2">
          {" "}
          {/* Arama kutusunun genişliği değişebilir */}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Başlık, etiket veya açıklama ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border-2 border-border focus:border-primary transition-colors rounded-lg w-full"
          />
        </div>

        {(searchQuery !== "" ||
          mediaFilter !== "all" ||
          tagFilter !== "all") && (
          <Button
            type="button"
            variant="destructive" // Farklı bir renk için variant="destructive" kullandık
            size="sm"
            className="flex items-center gap-2 text-white hover:bg-red-600 transition-colors md:w-auto w-full"
            onClick={clearFilters}
          >
            <Eraser className="w-4 h-4" />
            Temizle
          </Button>
        )}

        <div className="flex flex-wrap md:flex-nowrap gap-2 items-center justify-center md:justify-start flex-shrink-0">
          {" "}
          {/* Filtreleme kısmı sabit kalır */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <File className="mr-2 h-4 w-4" />
                İçerik Türü
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={mediaFilter}
                onValueChange={(value) =>
                  setMediaFilter(
                    value as "all" | "both" | "links" | "files" | "none"
                  )
                }
              >
                <DropdownMenuRadioItem value="all">Tümü</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="both">
                  Link & Dosya
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="links">
                  Sadece Link
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="files">
                  Sadece Dosya
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="none">
                  Hiçbiri
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <Tag className="mr-2 h-4 w-4" />
                Etiketler
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={tagFilter}
                onValueChange={setTagFilter}
              >
                <DropdownMenuRadioItem value="all">Tümü</DropdownMenuRadioItem>
                <Separator />
                {allTags.map((tag) => (
                  <DropdownMenuRadioItem key={tag} value={tag}>
                    {tag}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator className="my-6" />

      {filteredAcademics.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Hiç kayıt bulunamadı.
          </h2>
          <p className="mt-2 text-muted-foreground">
            Aramanıza uygun bir sonuç yok veya henüz kayıt eklenmedi.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAcademics.map((academic) => (
            <div
              key={academic.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-card rounded-xl border border-border/70 hover:bg-muted/50 transition-colors duration-300"
            >
              <div className="flex-grow min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {academic.title}
                  </h3>
                  {/* The 'Yayında' badge has been removed from here */}
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed break-words break-all whitespace-normal">
                  {academic.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.isArray(academic.tags) &&
                    academic.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        <Tag className="mr-1 h-3 w-3" /> {tag}
                      </Badge>
                    ))}
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col md:flex-row items-end md:items-center gap-4 mt-4 md:mt-0 w-full md:w-auto">
                <div className="flex flex-col md:flex-row gap-4 justify-start md:justify-end w-full md:w-auto">
                  <div className="flex flex-col items-start gap-2 flex-grow-0 w-[120px]">
                    <h4 className="font-semibold text-sm text-foreground/80">
                      Linkler
                    </h4>
                    <div className="flex flex-wrap gap-2 w-full">
                      {academic.links &&
                        academic.links.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center h-8 w-8 text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                          >
                            <Link2 className="h-4 w-4" />
                          </a>
                        ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2 flex-grow-0 w-[120px]">
                    <h4 className="font-semibold text-sm text-foreground/80">
                      Dosyalar
                    </h4>
                    <div className="flex flex-wrap gap-2 w-full">
                      {academic.files &&
                        academic.files.map((file, index) => (
                          <a
                            key={index}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center h-8 w-8 text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                          >
                            <File className="h-4 w-4" />
                          </a>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 flex flex-col items-end md:items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
                  <span className="flex items-center text-sm text-muted-foreground mr-auto md:mr-0">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(academic.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAcademicList;
