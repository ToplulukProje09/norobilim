"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  AlertCircle,
  Eye,
  Search,
  ArrowLeft,
  Clock,
  Mic,
  Calendar,
  Tag,
  Music,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  audioUrl: string;
  coverImage: string | null;
  duration: number | null;
  speakers: string[];
  episodeNumber: number | null;
  seriesTitle: string | null;
  releaseDate: string | null;
  tags: string[];
  isPublished: boolean;
  listens: number;
}

interface DialogState {
  isOpen: boolean;
  title: string;
  description: string;
  type: "success" | "error" | "info";
}

export default function UserPodcasts({
  initialPodcasts,
}: {
  initialPodcasts: Podcast[];
}) {
  const [podcasts] = useState<Podcast[]>(initialPodcasts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
  const router = useRouter();

  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: "",
    description: "",
    type: "info",
  });

  const showDialog = (
    title: string,
    description: string,
    type: "success" | "error" | "info"
  ) => {
    setDialogState({ isOpen: true, title, description, type });
  };

  const formatDuration = (durationInSeconds: number | null) => {
    if (!durationInSeconds) return "Bilinmiyor";
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds} dk`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Bilinmiyor";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  // Uzun kelimeleri bozmadan satır kırılabilsin diye görünmez kırılma ekler
  const insertZws = (text?: string, chunk: number = 12) => {
    if (!text) return text ?? "";
    return text
      .split(" ")
      .map((token) => {
        if (token.length <= chunk) return token;
        const parts: string[] = [];
        for (let i = 0; i < token.length; i += chunk) {
          parts.push(token.slice(i, i + chunk));
        }
        return parts.join("\u200B"); // Zero-Width Space
      })
      .join(" ");
  };

  // SADECE YAYINLANMIŞ PODCAST'LERDEN ETİKETLERİ TOPLA
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    podcasts.forEach((p) => {
      if (p.isPublished) {
        p.tags.forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [podcasts]);

  // SADECE YAYINLANMIŞ PODCAST'LERDEN SERİLERİ TOPLA
  const allSeries = useMemo(() => {
    const series = new Set<string>();
    podcasts.forEach((p) => {
      if (p.isPublished && p.seriesTitle) {
        series.add(p.seriesTitle);
      }
    });
    return Array.from(series).sort();
  }, [podcasts]);

  // SADECE YAYINLANMIŞ PODCAST'LERDEN KONUŞMACILARI TOPLA
  const allSpeakers = useMemo(() => {
    const speakers = new Set<string>();
    podcasts.forEach((p) => {
      if (p.isPublished) {
        p.speakers.forEach((speaker) => speakers.add(speaker));
      }
    });
    return Array.from(speakers).sort();
  }, [podcasts]);

  const filteredPodcasts = useMemo(() => {
    return podcasts.filter((p) => {
      // SADECE YAYINDAKİ PODCAST'LERİ GÖSTER
      if (!p.isPublished) return false;

      const lowercasedQuery = searchQuery.toLowerCase();

      const matchesSearch =
        p.title.toLowerCase().includes(lowercasedQuery) ||
        (p.description &&
          p.description.toLowerCase().includes(lowercasedQuery)) ||
        p.speakers.some((speaker) =>
          speaker.toLowerCase().includes(lowercasedQuery)
        ) ||
        p.tags.some((tag) => tag.toLowerCase().includes(lowercasedQuery)) ||
        (p.seriesTitle &&
          p.seriesTitle.toLowerCase().includes(lowercasedQuery)) ||
        (p.episodeNumber && p.episodeNumber.toString() === lowercasedQuery);

      const matchesTag = !selectedTag || p.tags.includes(selectedTag);
      const matchesSeries =
        selectedSeries === null || p.seriesTitle === selectedSeries;
      const matchesSpeaker =
        selectedSpeaker === null || p.speakers.includes(selectedSpeaker);

      return matchesSearch && matchesTag && matchesSeries && matchesSpeaker;
    });
  }, [podcasts, searchQuery, selectedTag, selectedSeries, selectedSpeaker]);

  const handleListenClick = async (podcastId: string, audioUrl: string) => {
    try {
      const res = await fetch(`/api/podcasts/${podcastId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "spotify-listen" }), // 🔑 eklendi
      });

      if (!res.ok) {
        // 429 (limit aşıldı) durumunda tamamen sessiz geç
        if (res.status !== 429) {
          const errorData = await res.json();
          console.error("Dinlenme artırma hatası:", errorData.message);
        }
      } else {
        // Başarılıysa state güncellemesi yapabilirsin (istersen ekle)
        // burada sen state güncellemesi yapmıyorsun çünkü sadece açıyorsun
      }
    } catch (err) {
      console.error("Dinlenme API çağrısı başarısız:", err);
      showDialog("Hata!", "Dinlenme API çağrısı başarısız.", "error");
    } finally {
      window.open(audioUrl, "_blank");
    }
  };

  const renderContent = () => {
    if (filteredPodcasts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full text-center p-8">
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg shadow-lg max-w-lg w-full transition-all duration-300 transform hover:scale-105">
            <AlertCircle className="h-20 w-20 text-muted-foreground opacity-30 mb-6" />
            <h2 className="text-3xl font-bold text-foreground">
              Sonuç Bulunamadı!
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Aradığınız kriterlere uygun bir podcast bulunamadı. Lütfen
              filtrelerinizi veya arama sorgunuzu değiştirip tekrar deneyin.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag(null);
                setSelectedSeries(null);
                setSelectedSpeaker(null);
              }}
              className="mt-6 shadow-md"
            >
              <Search className="h-4 w-4 mr-2" /> Filtreleri Temizle
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPodcasts.map((p) => (
          <Card
            key={p.id}
            className="relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 border-gray-200 dark:border-gray-700 bg-card text-card-foreground"
          >
            {p.coverImage ? (
              <div className="relative h-48 w-full flex-shrink-0">
                <Image
                  src={p.coverImage}
                  alt={p.title}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 transition-all duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                  <h3 className="text-xl md:text-2xl font-bold leading-tight">
                    {p.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {p.episodeNumber && (
                      <Badge className="bg-white/20 text-white border-none backdrop-blur-sm text-sm">
                        Bölüm #{p.episodeNumber}
                      </Badge>
                    )}
                    {p.seriesTitle && (
                      <Badge className="bg-white/20 text-white border-none backdrop-blur-sm text-sm">
                        Seri: {p.seriesTitle}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-48 w-full flex-shrink-0">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600">
                  <Music className="h-24 w-24 opacity-50" />
                </div>
                <div className="absolute inset-0 bg-black/50 transition-all duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                  <h3 className="text-xl md:text-2xl font-bold leading-tight">
                    {insertZws(p.title)}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {p.episodeNumber && (
                      <Badge className="bg-white/20 text-white border-none backdrop-blur-sm text-sm">
                        Bölüm #{p.episodeNumber}
                      </Badge>
                    )}
                    {p.seriesTitle && (
                      <Badge className="bg-white/20 text-white border-none backdrop-blur-sm text-sm">
                        Seri: {p.seriesTitle}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
            <CardContent className="grid gap-3 p-4 pt-4">
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {insertZws(p.description ?? "Açıklama mevcut değil.")}
              </CardDescription>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-start">
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Mic className="h-4 w-4 text-primary" />
                    <span className="font-medium">Konuşmacılar:</span>
                  </div>
                  <div className="flex-1 min-w-0 break-words ml-1">
                    {p.speakers.length > 0
                      ? p.speakers.join(", ")
                      : "Bilinmiyor"}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 flex justify-center items-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">Süre:</span>{" "}
                    {formatDuration(p.duration)}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 flex justify-center items-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">Yayın Tarihi:</span>{" "}
                    {formatDate(p.releaseDate)}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 flex justify-center items-center">
                    <Eye className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">Dinlenme:</span> {p.listens}
                  </div>
                </div>
              </div>
              <Separator className="bg-gray-200 dark:bg-gray-700 my-2" />
              <div className="flex flex-wrap gap-2">
                {p.tags.length > 0 ? (
                  p.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="flex items-center gap-1.5 bg-gray-100 text-gray-700 border border-gray-200 shadow-sm transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Etiket yok
                  </Badge>
                )}
              </div>
            </CardContent>

            <CardFooter className="mt-auto p-4 pt-0">
              <Button
                onClick={() => handleListenClick(p.id, p.audioUrl)}
                className="w-full shadow-md bg-green-500 hover:bg-green-600 text-white dark:bg-green-700 dark:hover:bg-green-800"
              >
                Dinle
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Anasayfa
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="relative w-full md:w-1/3 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Başlık, açıklama, seri, etiket veya konuşmacı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-5 py-2.5 text-base rounded-md border border-input bg-background dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="w-full">
            <Select
              onValueChange={(value) =>
                setSelectedTag(value === "all" ? null : value)
              }
              value={selectedTag || "all"}
            >
              <SelectTrigger className="w-full py-2.5 text-base rounded-md border border-input bg-background dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                <SelectValue placeholder="Tüm Etiketler" />
              </SelectTrigger>
              <SelectContent
                className={
                  allTags.length > 3 ? "max-h-[10rem] overflow-y-auto" : ""
                }
              >
                <SelectItem value="all">Tüm Etiketler</SelectItem>
                <Separator className="my-1 bg-gray-200 dark:bg-gray-700" />
                <SelectGroup>
                  <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Etiketler
                  </SelectLabel>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full">
            <Select
              onValueChange={(value) =>
                setSelectedSeries(value === "all" ? null : value)
              }
              value={selectedSeries || "all"}
            >
              <SelectTrigger className="w-full py-2.5 text-base rounded-md border border-input bg-background dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                <SelectValue placeholder="Tüm Seriler" />
              </SelectTrigger>
              <SelectContent
                className={
                  allSeries.length > 3 ? "max-h-[10rem] overflow-y-auto" : ""
                }
              >
                <SelectItem value="all">Tüm Seriler</SelectItem>
                <Separator className="my-1 bg-gray-200 dark:bg-gray-700" />
                <SelectGroup>
                  <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Seri Adı
                  </SelectLabel>
                  {allSeries.map((series) => (
                    <SelectItem key={series} value={series}>
                      {series}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full">
            <Select
              onValueChange={(value) =>
                setSelectedSpeaker(value === "all" ? null : value)
              }
              value={selectedSpeaker || "all"}
            >
              <SelectTrigger className="w-full py-2.5 text-base rounded-md border border-input bg-background dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                <SelectValue placeholder="Tüm Konuşmacılar" />
              </SelectTrigger>
              <SelectContent
                className={
                  allSpeakers.length > 3 ? "max-h-[10rem] overflow-y-auto" : ""
                }
              >
                <SelectItem value="all">Tüm Konuşmacılar</SelectItem>
                <Separator className="my-1 bg-gray-200 dark:bg-gray-700" />
                <SelectGroup>
                  <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Konuşmacılar
                  </SelectLabel>
                  {allSpeakers.map((speaker) => (
                    <SelectItem key={speaker} value={speaker}>
                      {speaker}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {renderContent()}
      </div>

      <Dialog
        open={dialogState.isOpen}
        onOpenChange={(isOpen) =>
          setDialogState((prev) => ({ ...prev, isOpen }))
        }
      >
        <DialogContent className="sm:max-w-[425px] rounded-lg shadow-2xl p-6 bg-card dark:bg-gray-800 text-foreground dark:text-gray-100 border border-gray-200 dark:border-gray-700">
          <DialogHeader className="text-center">
            {dialogState.type === "success" && (
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            )}
            {dialogState.type === "error" && (
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            )}
            {dialogState.type === "info" && (
              <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            )}
            <DialogTitle
              className={`text-2xl font-bold ${
                dialogState.type === "success"
                  ? "text-green-600"
                  : dialogState.type === "error"
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              {dialogState.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              {dialogState.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col gap-4">
            <Button
              onClick={() =>
                setDialogState((prev) => ({ ...prev, isOpen: false }))
              }
              className="w-full"
            >
              Tamam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
