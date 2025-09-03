"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  X,
  CheckCircle,
  ArrowLeft,
  Trash2,
  File,
  Plus,
  Link2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Academic } from "@prisma/client";
import { useRouter } from "next/navigation"; // <-- BU SATIRI EKLEYİNİZ

interface AdminAcademicFormProps {
  id?: string;
  initialData?: Academic | null;
}

type Notification = {
  id: string;
  type: "success" | "info" | "error";
  message: string;
};

const generateUniqueId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

const AdminAcademicForm = ({ id, initialData }: AdminAcademicFormProps) => {
  const router = useRouter(); // <-- BU SATIRI EKLEYİNİZ
  const [formData, setFormData] = useState<Omit<Academic, "id" | "createdAt">>(
    initialData
      ? {
          title: initialData.title,
          description: initialData.description || "",
          links: initialData.links || [],
          files: initialData.files || [],
          tags: initialData.tags || [],
          published: initialData.published,
        }
      : {
          title: "",
          description: "",
          links: [],
          files: [],
          tags: [],
          published: true,
        }
  );

  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [tagInputValue, setTagInputValue] = useState("");
  const [tagsLoading, setTagsLoading] = useState(false);

  // Define BASE_URL inside the component or import it
  // For Vercel/Next.js, you can use environment variables
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

  // ✅ Sadece API’den tag çek
  useEffect(() => {
    const fetchTags = async () => {
      setTagsLoading(true);
      try {
        const res = await fetch("/api/academic/tags");
        if (!res.ok) {
          throw new Error(
            `Etiketler yüklenemedi. Durum: ${res.status} ${res.statusText}`
          );
        }
        const data = await res.json();
        setAvailableTags(data.tags);
        showNotification("success", "Etiketler başarıyla yüklendi.");
      } catch (error: any) {
        showNotification("error", "Etiketler yüklenirken bir hata oluştu.");
        console.error("Failed to fetch tags:", error);
      } finally {
        setTagsLoading(false);
      }
    };
    fetchTags();
  }, []);

  const showNotification = (
    type: "success" | "info" | "error",
    message: string
  ) => {
    setNotifications((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].message === message) {
        return prev;
      }
      const newNotif: Notification = {
        id: generateUniqueId(),
        type,
        message,
      };
      const updatedNotifications = [...prev, newNotif];
      setTimeout(() => {
        setNotifications((current) =>
          current.filter((n) => n.id !== newNotif.id)
        );
      }, 5000);
      return updatedNotifications;
    });
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (
    arrayName: "links" | "files",
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const newArray = [...prev[arrayName]];
      newArray[index] = value;
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleAddToArray = (arrayName: "links" | "files") => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], ""],
    }));
    showNotification(
      "success",
      `Yeni ${arrayName === "links" ? "link" : "dosya"} alanı eklendi.`
    );
  };

  const handleRemoveFromArray = (
    arrayName: "links" | "files",
    index: number
  ) => {
    setFormData((prev) => {
      const newArray = prev[arrayName].filter((_, i) => i !== index);
      showNotification(
        "info",
        `${arrayName === "links" ? "Link" : "Dosya"} başarıyla silindi.`
      );
      return { ...prev, [arrayName]: newArray };
    });
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => {
      const isAdding = !prev.tags.includes(tag);
      const newTags = isAdding
        ? [...prev.tags, tag]
        : prev.tags.filter((t) => t !== tag);

      if (isAdding) {
        showNotification("success", `"${tag}" etiketi eklendi.`);
      } else {
        showNotification("info", `"${tag}" etiketi kaldırıldı.`);
      }

      return { ...prev, tags: newTags };
    });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataFile = new FormData();
    formDataFile.append("file", file);

    try {
      // Updated fetch call to use the relative URL
      const res = await fetch("/api/academic/upload", {
        method: "POST",
        body: formDataFile,
      });

      if (!res.ok) {
        throw new Error("Dosya yüklenirken bir hata oluştu.");
      }

      const { url } = await res.json();
      setFormData((prev) => ({ ...prev, files: [...prev.files, url] }));
      showNotification("success", "Dosya başarıyla yüklendi.");
    } catch (error: any) {
      showNotification("error", error.message);
      console.error("File upload error:", error);
    } finally {
      setIsUploading(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = {
      ...formData,
      links: formData.links.filter((link) => link !== ""),
      files: formData.files.filter((file) => file !== ""),
    };

    try {
      const method = id ? "PUT" : "POST";
      // Updated URL construction to use the relative path
      const url = id ? `/api/academic/${id}` : `/api/academic`;

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Kayıt işlemi başarısız oldu.");
      }

      showNotification(
        "success",
        id
          ? "Akademik kayıt başarıyla güncellendi."
          : "Yeni akademik kayıt başarıyla oluşturuldu."
      );
      window.location.href = "/adminacademics";
    } catch (error: any) {
      showNotification("error", error.message);
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInputValue) {
      e.preventDefault();
      handleTagToggle(tagInputValue);
      if (!availableTags.includes(tagInputValue)) {
        setAvailableTags((prev) => [...prev, tagInputValue]);
      }
      setTagInputValue("");
      setIsTagsOpen(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Button
        variant="ghost"
        onClick={() => router.push("/adminacademics")}
        className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-5 w-5" /> Geri
      </Button>

      <Card className="rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto dark:bg-zinc-900">
        <CardHeader className="bg-muted/40 p-6 border-b border-border/70 dark:bg-zinc-800">
          <CardTitle className="text-2xl font-bold">
            {id ? "Akademik Kaydı Düzenle" : "Yeni Akademik Kayıt Oluştur"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Örnek: Makine Öğrenmesi Uygulamaları"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Bu makale/proje hakkında kısa bir açıklama girin..."
                rows={4}
              />
            </div>

            <Separator />

            <div>
              <Label className="mb-2 flex items-center gap-2">
                <Link2 className="h-4 w-4" /> Linkler
              </Label>
              <div className="space-y-3 mt-2">
                {formData.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="url"
                      value={link}
                      onChange={(e) =>
                        handleArrayChange("links", index, e.target.value)
                      }
                      placeholder="https://örnek.com"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromArray("links", index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddToArray("links")}
                  className="w-full justify-start text-muted-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" /> Link Ekle
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="mb-2 flex items-center gap-2">
                <File className="h-4 w-4" /> Dosyalar
              </Label>
              <div className="space-y-3 mt-2">
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={file}
                      onChange={(e) =>
                        handleArrayChange("files", index, e.target.value)
                      }
                      placeholder="Dosya URL'si veya dosya yükle"
                      className="truncate"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromArray("files", index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <div className="relative">
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    className="w-full opacity-0 absolute z-10 cursor-pointer"
                    id="file-upload-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-muted-foreground"
                    disabled={isUploading}
                    onClick={() =>
                      document.getElementById("file-upload-input")?.click()
                    }
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" /> Dosya Yükle
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Etiketler</Label>
              <Popover open={isTagsOpen} onOpenChange={setIsTagsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isTagsOpen}
                    className="w-full justify-between"
                    disabled={tagsLoading}
                  >
                    <span>
                      {tagsLoading
                        ? "Etiketler yükleniyor..."
                        : "Etiket seçin..."}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Etiket ara veya oluştur..."
                      value={tagInputValue}
                      onValueChange={setTagInputValue}
                      onKeyDown={handleTagInputKeyDown}
                    />
                    <CommandEmpty>
                      <div className="py-2 text-center text-sm text-muted-foreground">
                        "{tagInputValue}" adında bir etiket yok. Enter'a basarak
                        oluşturabilirsiniz.
                      </div>
                    </CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                      {availableTags.map((tag) => (
                        <CommandItem
                          key={tag}
                          onSelect={() => handleTagToggle(tag)}
                          className="cursor-pointer flex items-center justify-between"
                        >
                          {tag}
                          {formData.tags.includes(tag) && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              {formData.tags.length > 0 && (
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Seçili Etiketler:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className="ml-1 text-muted-foreground/80 hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setFormData((prev) => ({
                    ...prev,
                    published: isChecked,
                  }));
                  showNotification(
                    isChecked ? "success" : "info",
                    `Kayıt artık ${
                      isChecked ? "yayınlandı" : "yayından kaldırıldı"
                    }.`
                  );
                }}
                className="form-checkbox h-4 w-4 text-primary rounded"
              />
              <label
                htmlFor="published"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Yayınla
              </label>
            </div>

            <Button
              type="submit"
              className="w-full py-2 px-4 transition-transform transform hover:scale-[1.01] active:scale-95 shadow-lg flex items-center justify-center gap-2"
              disabled={loading || isUploading}
            >
              {loading || isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isUploading ? "Yükleniyor..." : "Kaydediliyor..."}
                </>
              ) : id ? (
                "Güncelle"
              ) : (
                "Oluştur"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center space-y-2">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`p-4 rounded-lg shadow-xl text-white font-medium flex items-center gap-3 w-80 ${
                notif.type === "success"
                  ? "bg-green-500"
                  : notif.type === "info"
                  ? "bg-blue-500"
                  : "bg-red-500"
              }`}
            >
              {notif.type === "success" || notif.type === "info" ? (
                <CheckCircle />
              ) : (
                <AlertCircle />
              )}
              <span>{notif.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminAcademicForm;
