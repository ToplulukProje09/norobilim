"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Eraser } from "lucide-react";
import {
  AlertCircle,
  Eye,
  Search,
  ArrowLeft,
  Plus,
  Calendar,
  Tag,
  Edit,
  Trash2,
  CheckCircle,
  Link2,
  File,
  Globe,
  DraftingCompass,
  Filter,
  Loader2,
  Check,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Academic } from "@/types/academic";

interface AcademicListProps {
  initialAcademics: Academic[];
}

const AcademicList = ({ initialAcademics }: AcademicListProps) => {
  const router = useRouter();
  const [academics, setAcademics] = useState<Academic[]>(initialAcademics);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: "",
    description: "",
    isSuccess: false,
  });
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [publishedFilter, setPublishedFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [mediaFilter, setMediaFilter] = useState<
    "all" | "both" | "links" | "files" | "none"
  >("all");
  const [tagFilter, setTagFilter] = useState<string>("all");

  const clearFilters = () => {
    setSearchQuery("");
    setPublishedFilter("all");
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

  const filteredAcademics = useMemo(() => {
    return academics.filter((academic) => {
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

      const matchesPublished =
        publishedFilter === "all" ||
        (publishedFilter === "published" && academic.published) ||
        (publishedFilter === "draft" && !academic.published);

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

      return matchesSearch && matchesPublished && matchesMedia && matchesTag;
    });
  }, [academics, searchQuery, publishedFilter, mediaFilter, tagFilter]);

  const handleDelete = useCallback((_id: string) => {
    setConfirmationDialog({
      isOpen: true,
      title: "Kaydı Sil",
      description:
        "Bu akademik kaydı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      onConfirm: async () => {
        setDeletingId(_id);
        try {
          const res = await fetch(`/api/academic/${_id}`, {
            method: "DELETE",
          });

          if (res.status === 404) {
            throw new Error("Silinecek kayıt bulunamadı.");
          }
          if (!res.ok) {
            throw new Error("Silme işlemi başarısız oldu.");
          }

          setAcademics((prev) => prev.filter((item) => item._id !== _id));
          setDialogState({
            isOpen: true,
            title: "Başarılı",
            description: "Kayıt başarıyla silindi.",
            isSuccess: true,
          });
          setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Silme hatası:", error);
          setDialogState({
            isOpen: true,
            title: "Hata",
            description:
              error instanceof Error
                ? error.message
                : "Silme işlemi sırasında bir hata oluştu.",
            isSuccess: false,
          });
        } finally {
          setDeletingId(null);
        }
      },
    });
  }, []);

  const handleTogglePublished = useCallback(
    async (_id: string, published: boolean) => {
      setTogglingId(_id);
      try {
        const res = await fetch(`/api/academic/${_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published: !published }),
        });

        if (!res.ok) {
          throw new Error("Yayınlama durumu güncellenemedi.");
        }

        const updatedAcademic = await res.json();
        setAcademics((prev) =>
          prev.map((item) => (item._id === _id ? updatedAcademic.data : item))
        );

        setDialogState({
          isOpen: true,
          title: "Başarılı",
          description: updatedAcademic.data.published
            ? "Kayıt başarıyla yayınlandı."
            : "Kayıt yayından kaldırıldı.",
          isSuccess: true,
        });
      } catch (error) {
        console.error("Güncelleme hatası:", error);
        setDialogState({
          isOpen: true,
          title: "Hata",
          description:
            error instanceof Error
              ? error.message
              : "Yayınlama durumu güncellenirken bir hata oluştu.",
          isSuccess: false,
        });
      } finally {
        setTogglingId(null);
      }
    },
    []
  );

  return (
    <div className="container mx-auto p-4 md:p-8 dark:bg-gray-950 dark:text-white">
      <div className="flex justify-between items-center mb-6 flex-col md:flex-row">
        <div className="flex items-center gap-2 mb-4 md:mb-0 w-full md:w-auto">
          <Button
            onClick={() => router.push("/admin")}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground dark:text-gray-50">
            Akademik Kayıtlar
          </h1>
        </div>
        <Button onClick={() => router.push("/adminacademics/new")}>
          <Plus className="mr-2 h-4 w-4" /> Yeni Ekle
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Başlık, etiket veya açıklama ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border-2 border-border focus:border-primary transition-colors rounded-lg w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-primary"
          />
        </div>

        {(searchQuery !== "" ||
          publishedFilter !== "all" ||
          mediaFilter !== "all" ||
          tagFilter !== "all") && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="flex items-center gap-2 text-white hover:bg-red-600 transition-colors md:w-auto w-full"
            onClick={clearFilters}
          >
            <Eraser className="w-4 h-4" />
            Temizle
          </Button>
        )}

        <div className="flex flex-wrap md:flex-nowrap gap-2 items-center justify-center md:justify-start flex-shrink-0 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full md:w-auto dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <Filter className="mr-2 h-4 w-4" />
                Yayın Durumu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
              <DropdownMenuRadioGroup
                value={publishedFilter}
                onValueChange={(value) =>
                  setPublishedFilter(value as "all" | "published" | "draft")
                }
              >
                <DropdownMenuRadioItem
                  value="all"
                  className="dark:text-white dark:hover:bg-gray-700"
                >
                  Tümü
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="published"
                  className="dark:text-white dark:hover:bg-gray-700"
                >
                  Yayında
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="draft"
                  className="dark:text-white dark:hover:bg-gray-700"
                >
                  Taslak
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full md:w-auto dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <File className="mr-2 h-4 w-4" />
                İçerik Türü
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
              <DropdownMenuRadioGroup
                value={mediaFilter}
                onValueChange={(value) =>
                  setMediaFilter(
                    value as "all" | "both" | "links" | "files" | "none"
                  )
                }
              >
                <DropdownMenuRadioItem
                  value="all"
                  className="dark:text-white dark:hover:bg-gray-700"
                >
                  Tümü
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="both"
                  className="dark:text-white dark:hover:bg-gray-700"
                >
                  Link & Dosya
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="links"
                  className="dark:text-white dark:hover:bg-gray-700"
                >
                  Sadece Link
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="files"
                  className="dark:text-white dark:hover:bg-gray-700"
                >
                  Sadece Dosya
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="none"
                  className="dark:text-white dark:hover:bg-gray-700"
                >
                  Hiçbiri
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full md:w-auto dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <Tag className="mr-2 h-4 w-4" />
                Etiketler
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
              <DropdownMenuRadioGroup
                value={tagFilter}
                onValueChange={setTagFilter}
              >
                <DropdownMenuRadioItem
                  value="all"
                  className="dark:text-white dark:hover:bg-gray-700"
                >
                  Tümü
                </DropdownMenuRadioItem>
                <Separator className="dark:bg-gray-700" />
                {allTags.map((tag) => (
                  <DropdownMenuRadioItem
                    key={tag}
                    value={tag}
                    className="dark:text-white dark:hover:bg-gray-700"
                  >
                    {tag}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator className="my-6 dark:bg-gray-700" />

      {filteredAcademics.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-muted-foreground dark:text-gray-400">
            Hiç kayıt bulunamadı.
          </h2>
          <p className="mt-2 text-muted-foreground dark:text-gray-500">
            Aramanıza uygun bir sonuç yok veya henüz kayıt eklenmedi.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAcademics.map((academic, index) => (
            <div
              key={`${academic._id?.toString()}-${index}`}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-card rounded-xl border border-border/70 hover:bg-muted/50 transition-colors duration-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <div className="flex-grow min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-foreground dark:text-gray-100">
                    {academic.title}
                  </h3>
                  <Badge
                    variant={academic.published ? "default" : "secondary"}
                    className="dark:text-white dark:bg-gray-700"
                  >
                    {academic.published ? (
                      <Globe className="mr-1 h-3 w-3" />
                    ) : (
                      <DraftingCompass className="mr-1 h-3 w-3" />
                    )}
                    {academic.published ? "Yayında" : "Taslak"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed break-words break-all whitespace-normal dark:text-gray-400">
                  {academic.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.isArray(academic.tags) &&
                    academic.tags.map((tag, index) => (
                      <Badge
                        key={`${academic._id}-tag-${index}`}
                        variant="secondary"
                        className="dark:bg-gray-700 dark:text-gray-200"
                      >
                        <Tag className="mr-1 h-3 w-3" /> {tag}
                      </Badge>
                    ))}
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col md:flex-row items-end md:items-center gap-4 mt-4 md:mt-0 w-full md:w-auto">
                <div className="flex flex-col md:flex-row gap-4 justify-start md:justify-end w-full md:w-auto">
                  <div className="flex flex-col items-start gap-2 flex-grow-0 w-[120px]">
                    <h4 className="font-semibold text-sm text-foreground/80 dark:text-gray-300">
                      Linkler
                    </h4>
                    <div className="flex flex-wrap gap-2 w-full">
                      {academic.links.map((link, index) => (
                        <a
                          key={`${academic._id}-link-${index}`}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center h-8 w-8 text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors dark:bg-blue-600/20 dark:hover:bg-blue-600/30 dark:text-blue-400"
                        >
                          <Link2 className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2 flex-grow-0 w-[120px]">
                    <h4 className="font-semibold text-sm text-foreground/80 dark:text-gray-300">
                      Dosyalar
                    </h4>
                    <div className="flex flex-wrap gap-2 w-full">
                      {academic.files.map((file, index) => (
                        <a
                          key={`${academic._id}-file-${index}`}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center h-8 w-8 text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors dark:bg-blue-600/20 dark:hover:bg-blue-600/30 dark:text-blue-400"
                        >
                          <File className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 flex flex-col items-end md:items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
                  <span className="flex items-center text-sm text-muted-foreground mr-auto md:mr-0 dark:text-gray-500">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(academic.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleTogglePublished(academic._id, academic.published)
                      }
                      disabled={togglingId === academic._id}
                      aria-label="Toggle Publish"
                      className="dark:text-white dark:hover:bg-gray-700"
                    >
                      {togglingId === academic._id ? (
                        <Loader2 className="h-5 w-5 animate-spin dark:text-gray-400" />
                      ) : (
                        <CheckCircle
                          className={`h-5 w-5 ${
                            academic.published
                              ? "text-green-500"
                              : "text-gray-400 dark:text-gray-600"
                          }`}
                        />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        router.push(`/adminacademics/${academic._id}`)
                      }
                      aria-label="Edit"
                      className="dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(academic._id)}
                      disabled={deletingId === academic._id}
                      aria-label="Delete"
                      className="dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      {deletingId === academic._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={dialogState.isOpen}
        onOpenChange={(isOpen) => setDialogState({ ...dialogState, isOpen })}
      >
        <DialogContent className="sm:max-w-[425px] rounded-lg shadow-2xl p-6 bg-card dark:bg-gray-800">
          <DialogHeader className="text-center">
            {dialogState.isSuccess ? (
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            ) : (
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            )}
            <DialogTitle
              className={`text-2xl font-bold ${
                dialogState.isSuccess
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {dialogState.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2 dark:text-gray-400">
              {dialogState.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setDialogState({ ...dialogState, isOpen: false })}
              className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
            >
              Tamam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmationDialog.isOpen}
        onOpenChange={(isOpen) =>
          setConfirmationDialog({ ...confirmationDialog, isOpen })
        }
      >
        <DialogContent className="sm:max-w-[425px] rounded-lg shadow-2xl p-6 bg-card dark:bg-gray-800">
          <DialogHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              {confirmationDialog.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2 dark:text-gray-400">
              {confirmationDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col gap-4">
            <Button
              onClick={confirmationDialog.onConfirm}
              className="w-full bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
              disabled={deletingId !== null}
            >
              {deletingId !== null ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Evet, Sil"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademicList;
