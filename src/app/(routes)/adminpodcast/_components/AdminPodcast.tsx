"use client";

// Gerekli importlar
import { useState, useEffect, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
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
  CalendarDays,
  Clock,
  Mic,
  Tag,
  ImageIcon,
  Trash2,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import axios from "axios";
import { useTheme } from "next-themes";
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

// Helper function to generate a unique ID
const generateUniqueId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

interface Podcast {
  _id?: string;
  title: string;
  description?: string;
  audioUrl: string;
  coverImage?: string;
  duration?: number;
  speakers: string[];
  seriesTitle?: string;
  episodeNumber?: number;
  tags: string[];
  isPublished: boolean;
  listens?: number;
  releaseDate?: string;
}

interface Props {
  _id?: string;
}

interface Notification {
  _id: string;
  message: string;
  type: "success" | "error";
}

export default function PodcastForm({ _id }: Props) {
  const [podcast, setPodcast] = useState<Podcast>({
    title: "",
    description: "",
    audioUrl: "",
    coverImage: "",
    duration: undefined,
    speakers: [],
    seriesTitle: "",
    episodeNumber: undefined,
    tags: [],
    isPublished: true,
    listens: 0,
  });

  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [existingSpeakers, setExistingSpeakers] = useState<string[]>([]);
  const [existingSeriesTitles, setExistingSeriesTitles] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [isFetchingTags, setIsFetchingTags] = useState(true);
  const [isFetchingSpeakers, setIsFetchingSpeakers] = useState(true);
  const [isFetchingSeriesTitles, setIsFetchingSeriesTitles] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [speakerInput, setSpeakerInput] = useState("");
  const [seriesTitleInput, setSeriesTitleInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [speakerPopoverOpen, setSpeakerPopoverOpen] = useState(false);
  const [seriesTitlePopoverOpen, setSeriesTitlePopoverOpen] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  const addNotification = (message: string, type: "success" | "error") => {
    const newNotification = { _id: generateUniqueId(), message, type };
    setNotifications((prev) => [...prev, newNotification]);
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((n) => n._id !== newNotification._id)
      );
    }, 3000);
  };

  useEffect(() => {
    const fetchExistingTags = async () => {
      setIsFetchingTags(true);
      try {
        const res = await fetch("/api/podcasts/tags");
        if (!res.ok) throw new Error("Etiketler yüklenemedi");
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          setExistingTags(data.data);
        } else {
          throw new Error("API'den geçersiz etiket verisi geldi.");
        }
      } catch (err) {
        console.error(err);
        addNotification("Etiketler yüklenirken hata oluştu", "error");
        setExistingTags([]);
      } finally {
        setIsFetchingTags(false);
      }
    };

    const fetchExistingSpeakers = async () => {
      setIsFetchingSpeakers(true);
      try {
        const res = await fetch("/api/podcasts/speakers");
        if (!res.ok) throw new Error("Konuşmacılar yüklenemedi");
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          setExistingSpeakers(data.data);
        } else {
          throw new Error("API'den geçersiz konuşmacı verisi geldi.");
        }
      } catch (err) {
        console.error(err);
        addNotification("Konuşmacılar yüklenirken hata oluştu", "error");
        setExistingSpeakers([]);
      } finally {
        setIsFetchingSpeakers(false);
      }
    };

    // Yeni fonksiyon: Mevcut seri adlarını getir
    const fetchExistingSeriesTitles = async () => {
      setIsFetchingSeriesTitles(true);
      try {
        const res = await fetch("/api/podcasts/series-titles");
        if (!res.ok) throw new Error("Seri başlıkları yüklenemedi");
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          setExistingSeriesTitles(data.data);
        } else {
          throw new Error("API'den geçersiz seri başlığı verisi geldi.");
        }
      } catch (err) {
        console.error(err);
        addNotification("Seri başlıkları yüklenirken hata oluştu", "error");
        setExistingSeriesTitles([]);
      } finally {
        setIsFetchingSeriesTitles(false);
      }
    };

    fetchExistingTags();
    fetchExistingSpeakers();
    fetchExistingSeriesTitles();
  }, []);

  useEffect(() => {
    if (!_id) return;

    const fetchPodcast = async () => {
      try {
        const res = await fetch(`/api/podcasts/${_id}`);
        if (!res.ok) throw new Error("Podcast yüklenemedi");
        const data = await res.json();
        setPodcast({
          title: data.title,
          description: data.description || "",
          audioUrl: data.audioUrl || "",
          coverImage: data.coverImage || "",
          duration: data.duration,
          speakers: data.speakers || [],
          seriesTitle: data.seriesTitle || "",
          episodeNumber: data.episodeNumber,
          tags: data.tags || [],
          isPublished: data.isPublished ?? true,
          listens: data.listens,
          releaseDate: data.releaseDate,
        });
      } catch (err) {
        console.error(err);
        addNotification("Podcast yüklenirken hata oluştu", "error");
      }
    };
    fetchPodcast();
  }, [_id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPodcast((prev) => {
      const newPodcast = { ...prev, [name]: value };
      // Seri adı silindiğinde bölüm numarasını da temizle
      if (name === "seriesTitle" && value === "") {
        newPodcast.episodeNumber = undefined;
      }
      return newPodcast;
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === "" ? undefined : Number(value);
    setPodcast((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };

  const handlePublishedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setPodcast((prev) => ({
      ...prev,
      isPublished: checked,
    }));
  };

  const handleAddTag = (tagToAdd: string) => {
    const normalizedTag = tagToAdd.trim();
    if (normalizedTag !== "" && !podcast.tags.includes(normalizedTag)) {
      setPodcast((prev) => ({
        ...prev,
        tags: [...prev.tags, normalizedTag],
      }));
    }
    setTagInput("");
    setTagPopoverOpen(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPodcast((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddSpeaker = (speakerToAdd: string) => {
    const normalizedSpeaker = speakerToAdd.trim();
    if (
      normalizedSpeaker !== "" &&
      !podcast.speakers.includes(normalizedSpeaker)
    ) {
      setPodcast((prev) => ({
        ...prev,
        speakers: [...prev.speakers, normalizedSpeaker],
      }));
    }
    setSpeakerInput("");
    setSpeakerPopoverOpen(false);
  };

  const handleRemoveSpeaker = (speakerToRemove: string) => {
    setPodcast((prev) => ({
      ...prev,
      speakers: prev.speakers.filter((speaker) => speaker !== speakerToRemove),
    }));
  };

  // Yeni fonksiyon: Mevcut seri adlarını getir
  const handleAddSeriesTitle = (seriesTitleToAdd: string) => {
    const normalizedTitle = seriesTitleToAdd.trim();
    if (normalizedTitle !== "") {
      setPodcast((prev) => ({
        ...prev,
        seriesTitle: normalizedTitle,
      }));
      setSeriesTitleInput("");
      setSeriesTitlePopoverOpen(false);
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/podcasts/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(percentCompleted);
        },
      });
      setIsUploading(false);
      return res.data.urls[0];
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedImage(null);
      throw err;
    }
  };

  const handleFileChange = async (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      try {
        const imageUrl = await uploadImage(file);
        setPodcast((prev) => ({ ...prev, coverImage: imageUrl }));
        addNotification("Görsel başarıyla yüklendi.", "success");
      } catch (err) {
        addNotification("Görsel yüklenirken hata oluştu.", "error");
      }
    } else {
      addNotification("Lütfen bir resim dosyası seçin.", "error");
    }
  };

  const handleImageDelete = () => {
    setSelectedImage(null);
    setPodcast((prev) => ({ ...prev, coverImage: "" }));
    addNotification("Görsel başarıyla kaldırıldı.", "success");
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleButtonClick = () => {
    document.getElementById("hiddenFileInput")?.click();
  };

  const handleHiddenFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };
  // Find the handleSubmit function and change the method for updates

  const handleSubmit = async () => {
    if (!podcast.title || !podcast.audioUrl) {
      addNotification("Başlık ve ses dosyası URL'si zorunludur!", "error");
      return;
    }
    setLoading(true);

    try {
      const isUpdate = Boolean(_id);
      const url = isUpdate ? `/api/podcasts/${_id}` : "/api/podcasts";
      const method = isUpdate ? "PUT" : "POST";

      const dataToSend = {
        ...podcast,
        releaseDate: podcast.releaseDate ? new Date(podcast.releaseDate) : null,
      };

      // Eğer seriesTitle boşsa episodeNumber'ı da null/undefined olarak gönder
      if (!dataToSend.seriesTitle) {
        dataToSend.episodeNumber = undefined;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Bilinmeyen bir hata oluştu.");
      }

      addNotification(
        isUpdate
          ? "Podcast başarıyla güncellendi. ✅"
          : "Yeni podcast başarıyla oluşturuldu. 🎉",
        "success"
      );

      router.push("/adminpodcast");
      router.refresh();
    } catch (err: any) {
      addNotification(`Kaydetme hatası: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const imagePreviewUrl = selectedImage
    ? URL.createObjectURL(selectedImage)
    : podcast.coverImage;
  const isEpisodeNumberDisabled = !podcast.seriesTitle;

  const filteredTags = existingTags.filter(
    (tag) =>
      !podcast.tags.includes(tag) &&
      tag.toLowerCase().includes(tagInput.toLowerCase())
  );

  const filteredSpeakers = existingSpeakers.filter(
    (speaker) =>
      !podcast.speakers.includes(speaker) &&
      speaker.toLowerCase().includes(speakerInput.toLowerCase())
  );

  const filteredSeriesTitles = existingSeriesTitles.filter((title) =>
    title.toLowerCase().includes(seriesTitleInput.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors p-4 md:p-10 flex flex-col items-center">
      <Button
        variant="ghost"
        onClick={() => router.push("/adminpodcast")}
        className="absolute top-4 left-4 md:top-8 md:left-8 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors z-10"
      >
        <ArrowLeft className="h-5 w-5 mr-2" /> Geri Dön
      </Button>

      <Card className="w-full max-w-4xl bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-6 md:p-8 lg:p-10 space-y-6 transition-colors mt-12 md:mt-16">
        <CardHeader className="p-0">
          <CardTitle className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100">
            {_id ? "Podcast'i Düzenle 📝" : "Yeni Podcast Bölümü Oluştur ✍️"}
          </CardTitle>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Bu form, platformunuz için yeni bir podcast bölümü oluşturmanıza
            veya mevcut bir bölümü düzenlemenize olanak tanır. Lütfen tüm
            gerekli bilgileri eksiksiz doldurun.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Başlık (Zorunlu)</Label>
            <Input
              id="title"
              name="title"
              value={podcast.title}
              onChange={handleInputChange}
              placeholder="Podcast başlığını girin"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
            <Textarea
              id="description"
              name="description"
              value={podcast.description}
              onChange={handleInputChange}
              placeholder="Podcast'in içeriğini detaylıca açıklayın"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="audioUrl">Ses Dosyası URL'si (Zorunlu)</Label>
            <Input
              id="audioUrl"
              name="audioUrl"
              type="url"
              value={podcast.audioUrl}
              onChange={handleInputChange}
              placeholder="Spotify, SoundCloud vb. linkini girin"
              required
            />
          </div>

          {/* KAPAK GÖRSELİ BÖLÜMÜ - Yenilenmiş Kısım */}
          <div className="grid gap-2">
            <Label htmlFor="coverImage" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" /> Kapak
              Görseli (Opsiyonel)
            </Label>

            {/* Bu gizli input elementi, görselin varlığından bağımsız olarak her zaman DOM'da olmalıdır */}
            <input
              id="hiddenFileInput"
              type="file"
              accept="image/*"
              onChange={handleHiddenFileChange}
              className="hidden"
            />

            {/* Önizleme veya Yükleme Alanı */}
            {imagePreviewUrl && !isUploading ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative w-full md:w-80 h-48 md:h-64 rounded-xl overflow-hidden shadow-lg border-2 border-primary/50">
                  <Image
                    src={imagePreviewUrl!}
                    alt="Kapak Görseli Önizleme"
                    fill
                    style={{ objectFit: "cover" }}
                    priority
                    className="transition-opacity duration-300"
                  />
                </div>
                <div className="flex gap-4 w-full justify-center">
                  <Button
                    type="button"
                    onClick={handleButtonClick}
                    variant="outline"
                    className="w-1/2"
                  >
                    <Upload className="h-4 w-4 mr-2" /> Yeni Fotoğraf Ekle
                  </Button>
                  <Button
                    type="button"
                    onClick={handleImageDelete}
                    variant="destructive"
                    className="w-1/2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Görseli Sil
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl text-center transition-all duration-300 cursor-pointer hover:border-primary/50 dark:hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 group
                ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleButtonClick}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center w-full">
                    <Loader2 className="w-12 h-12 mb-2 text-primary-600 dark:text-primary-400 animate-spin" />
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Yükleniyor...
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      %{uploadProgress} tamamlandı
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload
                      className={`w-12 h-12 mb-2 transition-colors duration-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 ${
                        isDragActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    />
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {isDragActive
                        ? "Buraya bırakın..."
                        : "Dosya seçmek için tıklayın veya sürükleyip bırakın"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG, GIF gibi formatlar desteklenir.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
          {/* KAPAK GÖRSELİ BÖLÜMÜ SONU */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {/* Seri Adı Bölümü - 'X' butonu eklendi */}
            <div className="grid gap-2">
              <Label htmlFor="seriesTitle" className="flex items-center gap-2">
                Seri Adı (Opsiyonel)
              </Label>
              <div className="relative">
                <Popover
                  open={seriesTitlePopoverOpen}
                  onOpenChange={setSeriesTitlePopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Input
                      id="seriesTitle"
                      name="seriesTitle"
                      value={podcast.seriesTitle || ""}
                      onChange={(e) => {
                        setSeriesTitleInput(e.target.value);
                        handleInputChange(e);
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          seriesTitleInput.trim() !== ""
                        ) {
                          e.preventDefault();
                          handleAddSeriesTitle(seriesTitleInput);
                        }
                      }}
                      placeholder="Örn: Yapay Zeka Serisi"
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-[390px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Seri adı arayın..."
                        value={seriesTitleInput}
                        onValueChange={setSeriesTitleInput}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            seriesTitleInput.trim() !== ""
                          ) {
                            e.preventDefault();
                            handleAddSeriesTitle(seriesTitleInput);
                          }
                        }}
                      />
                      {isFetchingSeriesTitles ? (
                        <CommandEmpty>
                          Seri başlıkları yükleniyor...
                        </CommandEmpty>
                      ) : (
                        <>
                          <CommandGroup heading="Mevcut Seri Adları">
                            {filteredSeriesTitles.map((title) => (
                              <CommandItem
                                key={title}
                                onSelect={() => handleAddSeriesTitle(title)}
                              >
                                {title}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          {seriesTitleInput &&
                            !existingSeriesTitles.includes(
                              seriesTitleInput
                            ) && (
                              <CommandItem
                                onSelect={() =>
                                  handleAddSeriesTitle(seriesTitleInput)
                                }
                                className="text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900"
                              >
                                <span className="text-gray-500 dark:text-gray-400 mr-2">
                                  "
                                </span>
                                {seriesTitleInput}
                                <span className="text-gray-500 dark:text-gray-400 ml-2">
                                  " serisini oluştur
                                </span>
                              </CommandItem>
                            )}
                          {filteredSeriesTitles.length === 0 &&
                            !seriesTitleInput && (
                              <CommandEmpty>Seri adı bulunamadı.</CommandEmpty>
                            )}
                        </>
                      )}
                    </Command>
                  </PopoverContent>
                </Popover>
                {podcast.seriesTitle && (
                  <button
                    onClick={() => {
                      setPodcast((prev) => ({
                        ...prev,
                        seriesTitle: "",
                        episodeNumber: undefined,
                      }));
                      setSeriesTitleInput("");
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 
               text-gray-500 dark:text-gray-400 
               hover:text-gray-700 dark:hover:text-gray-200 
               bg-gray-200/40 dark:bg-gray-700/40
               hover:bg-gray-300/60 dark:hover:bg-gray-600/60
               p-0.5 rounded-full transition-colors"
                    aria-label="Clear series title"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            </div>
            {/* Seri Adı Bölümü SONU */}
            <div className="grid gap-2">
              <Label
                htmlFor="episodeNumber"
                className={`flex items-center gap-2`}
              >
                <CalendarDays className="h-4 w-4 text-muted-foreground" /> Bölüm
                Numarası
              </Label>
              <Input
                id="episodeNumber"
                name="episodeNumber"
                type="number"
                value={podcast.episodeNumber || ""}
                onChange={handleNumberChange}
                placeholder="Örn: 1"
                disabled={isEpisodeNumberDisabled}
              />
              {isEpisodeNumberDisabled && (
                <span className="text-xs text-red-500 font-normal mt-1">
                  (Seri adı girilmeden aktif olmaz)
                </span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Süre (dk)
                (Opsiyonel)
              </Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={podcast.duration || ""}
                onChange={handleNumberChange}
                placeholder="Örn: 45"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="speakers" className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-muted-foreground" /> Konuşmacılar
              (Opsiyonel)
            </Label>
            <Popover
              open={speakerPopoverOpen}
              onOpenChange={setSpeakerPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Input
                  id="speakers"
                  value={speakerInput}
                  onChange={(e) => setSpeakerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && speakerInput.trim() !== "") {
                      e.preventDefault();
                      handleAddSpeaker(speakerInput);
                    }
                  }}
                  placeholder="Konuşmacı arayın veya yeni bir konuşmacı oluşturun"
                />
              </PopoverTrigger>
              <PopoverContent className="w-[390px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Konuşmacı arayın..."
                    value={speakerInput}
                    onValueChange={setSpeakerInput}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && speakerInput.trim() !== "") {
                        e.preventDefault();
                        handleAddSpeaker(speakerInput);
                      }
                    }}
                  />
                  {isFetchingSpeakers ? (
                    <CommandEmpty>Konuşmacılar yükleniyor...</CommandEmpty>
                  ) : (
                    <>
                      <CommandGroup heading="Mevcut Konuşmacılar">
                        {filteredSpeakers.map((speaker) => (
                          <CommandItem
                            key={speaker}
                            onSelect={() => handleAddSpeaker(speaker)}
                          >
                            {speaker}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {speakerInput &&
                        !existingSpeakers.includes(speakerInput) &&
                        !podcast.speakers.includes(speakerInput) && (
                          <CommandItem
                            onSelect={() => handleAddSpeaker(speakerInput)}
                            className="text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900"
                          >
                            <span className="text-gray-500 dark:text-gray-400 mr-2">
                              "
                            </span>
                            {speakerInput}
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              " konuşmacısını oluştur
                            </span>
                          </CommandItem>
                        )}
                      {filteredSpeakers.length === 0 &&
                        (!speakerInput ||
                          existingSpeakers.includes(speakerInput) ||
                          podcast.speakers.includes(speakerInput)) && (
                          <CommandEmpty>Konuşmacı bulunamadı.</CommandEmpty>
                        )}
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex flex-wrap gap-2 mt-2">
              {podcast.speakers.length > 0 ? (
                podcast.speakers.map((speaker, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    {speaker}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpeaker(speaker)}
                      className="ml-1 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center justify-center text-blue-500 dark:text-blue-400"
                      style={{ width: "1em", height: "1em", lineHeight: "1em" }}
                    >
                      &times;
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Konuşmacı eklemek için yukarıdaki alana yazın ve Enter'a
                  basın.
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" /> Etiketler
              (Opsiyonel)
            </Label>
            <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
              <PopoverTrigger asChild>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Etiket arayın veya yeni bir etiket oluşturun"
                />
              </PopoverTrigger>
              <PopoverContent className="w-[390px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Etiket arayın..."
                    value={tagInput}
                    onValueChange={setTagInput}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim() !== "") {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      }
                    }}
                  />
                  {isFetchingTags ? (
                    <CommandEmpty>Etiketler yükleniyor...</CommandEmpty>
                  ) : (
                    <>
                      <CommandGroup heading="Mevcut Etiketler">
                        {filteredTags.map((tag) => (
                          <CommandItem
                            key={tag}
                            onSelect={() => handleAddTag(tag)}
                          >
                            {tag}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {tagInput &&
                        !existingTags.includes(tagInput) &&
                        !podcast.tags.includes(tagInput) && (
                          <CommandItem
                            onSelect={() => handleAddTag(tagInput)}
                            className="text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900"
                          >
                            <span className="text-gray-500 dark:text-gray-400 mr-2">
                              "
                            </span>
                            {tagInput}
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              " etiketini oluştur
                            </span>
                          </CommandItem>
                        )}
                      {filteredTags.length === 0 &&
                        (!tagInput ||
                          existingTags.includes(tagInput) ||
                          podcast.tags.includes(tagInput)) && (
                          <CommandEmpty>Etiket bulunamadı.</CommandEmpty>
                        )}
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex flex-wrap gap-2 mt-2">
              {podcast.tags.length > 0 ? (
                podcast.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center justify-center text-blue-500 dark:text-blue-400"
                      style={{ width: "1em", height: "1em", lineHeight: "1em" }}
                    >
                      &times;
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Etiket eklemek için yukarıdaki alana yazın ve Enter'a basın.
                </span>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border bg-gray-50 dark:bg-gray-800">
            <Label
              htmlFor="isPublished"
              className="flex items-center gap-2 text-sm font-medium cursor-pointer"
            >
              <span className="font-bold">Yayın Durumu:</span>
              <span
                className={`transition-colors duration-200 ease-in-out ${
                  podcast.isPublished ? "text-green-500" : "text-gray-500"
                }`}
              >
                {podcast.isPublished ? "Yayında" : "Taslak"}
              </span>
            </Label>
            <input
              type="checkbox"
              id="isPublished"
              checked={podcast.isPublished}
              onChange={handlePublishedChange}
              className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-indigo-600"
            />
          </div>

          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full py-2.5 text-lg font-bold transition-transform transform hover:scale-[1.01] active:scale-95 shadow-lg flex items-center justify-center gap-2"
            disabled={loading || isUploading}
          >
            {loading || isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />{" "}
                {isUploading
                  ? `Yükleniyor... (%${uploadProgress})`
                  : "Kaydediliyor..."}
              </>
            ) : _id ? (
              "Güncelle"
            ) : (
              "Oluştur"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif._id}
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 200 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`p-4 rounded-lg shadow-xl text-white font-medium flex items-center gap-3 ${
                notif.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {notif.type === "success" ? <CheckCircle /> : <X />}
              <span>{notif.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
