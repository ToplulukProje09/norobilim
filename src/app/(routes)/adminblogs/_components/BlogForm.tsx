"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, X, CheckCircle, Trash2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Helper function to generate a unique ID
const generateUniqueId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

interface Post {
  id?: string;
  title: string;
  description: string;
  paragraph?: string;
  shortText?: string;
  mainPhoto: string;
  images: string[];
  show: boolean;
  commentsAllowed: boolean; // 👈 Yeni alan
}

interface Props {
  id?: string;
}

interface FileUploadState {
  id: string;
  fileName: string;
  progress: number;
  isUploading: boolean;
  isUploaded: boolean;
  error: string | null;
}

interface Notification {
  id: string;
  message: string;
  type: "success" | "error";
}

export default function PostForm({ id }: Props) {
  const [post, setPost] = useState<Post>({
    title: "",
    description: "",
    paragraph: "",
    shortText: "",
    mainPhoto: "",
    images: [],
    show: true,
    commentsAllowed: true, // 👈 Yeni alanın varsayılan değeri
  });

  const [loading, setLoading] = useState(false);
  const [mainPhotoState, setMainPhotoState] = useState<FileUploadState | null>(
    null
  );
  const [imageUploadStates, setImageUploadStates] = useState<FileUploadState[]>(
    []
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  const addNotification = (message: string, type: "success" | "error") => {
    const newNotification = { id: generateUniqueId(), message, type };
    setNotifications((prev) => [...prev, newNotification]);
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== newNotification.id)
      );
    }, 3000);
  };

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blogs/${id}`);
        if (!res.ok) throw new Error("Post yüklenemedi");
        const data = await res.json();
        setPost({
          title: data.title,
          description: data.description,
          paragraph: data.paragraph || "",
          shortText: data.shortText || "",
          mainPhoto: data.mainPhoto,
          images: data.images || [],
          show: data.show || false,
          commentsAllowed: data.commentsAllowed ?? true, // 👈 Yeni Alan
        });
        if (data.mainPhoto) {
          setMainPhotoState({
            id: generateUniqueId(),
            fileName: data.mainPhoto.split("/").pop() || "",
            progress: 100,
            isUploading: false,
            isUploaded: true,
            error: null,
          });
        }
      } catch (err) {
        console.error(err);
        addNotification("Post yüklenirken hata oluştu", "error");
      }
    };
    fetchPost();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPost((prev) => ({
      ...prev,
      show: e.target.checked,
    }));
  };

  const handleCommentsAllowedChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPost((prev) => ({
      ...prev,
      commentsAllowed: e.target.checked,
    }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "mainPhoto" | "images"
  ) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);

    if (type === "mainPhoto") {
      const isExistingPhoto = !!post.mainPhoto;
      const file = files[0];
      const newId = generateUniqueId();
      setMainPhotoState({
        id: newId,
        fileName: file.name,
        progress: 0,
        isUploading: true,
        isUploaded: false,
        error: null,
      });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post("/api/blogs/upload", formData, {
          onUploadProgress: (progressEvent) => {
            const percent = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setMainPhotoState((prev) =>
              prev ? { ...prev, progress: percent } : null
            );
          },
        });
        const url = res.data.urls[0];
        setPost((prev) => ({ ...prev, mainPhoto: url }));
        setMainPhotoState((prev) =>
          prev
            ? { ...prev, isUploading: false, isUploaded: true, progress: 100 }
            : null
        );
        addNotification(
          isExistingPhoto
            ? "Ana fotoğraf başarıyla değiştirildi."
            : "Ana fotoğraf başarıyla yüklendi.",
          "success"
        );
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || "Bilinmeyen Hata";
        setMainPhotoState((prev) =>
          prev ? { ...prev, isUploading: false, error: errorMsg } : null
        );
        addNotification(
          `Ana fotoğraf yüklenirken hata oluştu: ${errorMsg}`,
          "error"
        );
      }
    } else {
      const newFiles = files.map((file) => ({
        id: generateUniqueId(),
        fileName: file.name,
        progress: 0,
        isUploading: true,
        isUploaded: false,
        error: null,
      }));
      setImageUploadStates((prev) => [...prev, ...newFiles]);

      files.forEach(async (file, index) => {
        const uploadState = newFiles[index];
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await axios.post("/api/blogs/upload", formData, {
            onUploadProgress: (progressEvent) => {
              const percent = progressEvent.total
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;
              setImageUploadStates((prev) =>
                prev.map((item) =>
                  item.id === uploadState.id
                    ? { ...item, progress: percent }
                    : item
                )
              );
            },
          });
          const url = res.data.urls[0];
          setPost((prev) => ({ ...prev, images: [...prev.images, url] }));
          setImageUploadStates((prev) =>
            prev.map((item) =>
              item.id === uploadState.id
                ? {
                    ...item,
                    isUploading: false,
                    isUploaded: true,
                    progress: 100,
                  }
                : item
            )
          );
          addNotification(`"${uploadState.fileName}" yüklendi.`, "success");
        } catch (err: any) {
          const errorMsg = err.response?.data?.message || "Bilinmeyen Hata";
          setImageUploadStates((prev) =>
            prev.map((item) =>
              item.id === uploadState.id
                ? { ...item, isUploading: false, error: errorMsg }
                : item
            )
          );
          addNotification(
            `"${uploadState.fileName}" yüklenirken hata oluştu: ${errorMsg}`,
            "error"
          );
        }
      });
    }
  };

  const handleRemoveMain = () => {
    setPost((prev) => ({ ...prev, mainPhoto: "" }));
    setMainPhotoState(null);
    addNotification("Ana fotoğraf başarıyla kaldırıldı.", "success");
  };

  const handleRemoveImage = (index: number) => {
    setPost((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    addNotification("Ek fotoğraf başarıyla silindi.", "success");
  };

  const handleSubmit = async () => {
    if (!post.title || !post.description || !post.mainPhoto) {
      addNotification("Başlık, açıklama ve ana foto zorunludur!", "error");
      return;
    }
    setLoading(true);
    try {
      const url = id ? `/api/blogs/${id}` : "/api/blogs";
      const method = id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      if (!res.ok) throw new Error(await res.text());

      addNotification("Post başarıyla kaydedildi.", "success");
      router.push("/adminblogs");
      router.refresh();
    } catch (err: any) {
      addNotification(`Kaydetme hatası: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors p-4 md:p-10 flex flex-col items-center">
      <Button
        variant="ghost"
        onClick={() => router.push("/adminblogs")}
        className="absolute top-4 left-4 md:top-8 md:left-8 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" /> Geri Dön
      </Button>

      <Card className="w-full max-w-4xl bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-6 md:p-8 lg:p-10 space-y-6 transition-colors mt-12 md:mt-16">
        <CardHeader className="p-0">
          <CardTitle className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100">
            {id ? "Postu Düzenle 📝" : "Yeni Post Oluştur ✍️"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Başlık
              </Label>
              <Input
                id="title"
                name="title"
                value={post.title}
                onChange={handleInputChange}
                placeholder="Başlık girin..."
                className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="shortText"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Kısa Metin
              </Label>
              <Input
                id="shortText"
                name="shortText"
                value={post.shortText || ""}
                onChange={handleInputChange}
                placeholder="Kısa açıklama (opsiyonel)..."
                className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 rounded-lg"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Açıklama
            </Label>
            <Textarea
              id="description"
              name="description"
              value={post.description}
              onChange={handleInputChange}
              placeholder="Kısa açıklama..."
              className="min-h-[80px] dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="paragraph"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Paragraf
            </Label>
            <Textarea
              id="paragraph"
              name="paragraph"
              value={post.paragraph || ""}
              onChange={handleInputChange}
              placeholder="Detaylı içerik..."
              className="min-h-[120px] dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 rounded-lg"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ana Fotoğraf
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "mainPhoto")}
                className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 file:text-blue-500 file:bg-transparent file:border-none file:mr-4 file:cursor-pointer rounded-lg"
              />
              <AnimatePresence>
                {(post.mainPhoto || mainPhotoState) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col md:flex-row items-center gap-4 mt-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-inner"
                  >
                    <div className="relative w-full md:w-28 h-40 md:h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      {post.mainPhoto && (
                        <img
                          src={post.mainPhoto}
                          alt="Ana Fotoğraf"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {mainPhotoState?.isUploading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <span className="mt-2 text-sm font-semibold">
                            {mainPhotoState.progress}%
                          </span>
                        </div>
                      )}
                      {mainPhotoState?.error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/70 text-white">
                          <X className="w-8 h-8" />
                          <span className="mt-2 text-xs text-center">Hata</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1 w-full text-center md:text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {mainPhotoState?.isUploading && "Yükleniyor..."}
                        {mainPhotoState?.isUploaded && "Yüklendi! 🎉"}
                        {mainPhotoState?.error && "Yükleme Hatası 😔"}
                        {post.mainPhoto && !mainPhotoState && "Mevcut Fotoğraf"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {mainPhotoState?.isUploading &&
                          `Yükleme ${mainPhotoState.progress}% tamamlandı.`}
                        {mainPhotoState?.isUploaded &&
                          (!!post.mainPhoto
                            ? "Yeni fotoğraf başarıyla değiştirildi."
                            : "Yeni fotoğraf başarıyla yüklendi.")}
                        {mainPhotoState?.error &&
                          `Hata: ${mainPhotoState.error}`}
                        {post.mainPhoto &&
                          !mainPhotoState &&
                          `Adres: ${post.mainPhoto.split("/").pop()}`}
                      </p>
                      {post.mainPhoto && (
                        <div className="mt-2 md:text-left text-center">
                          <Button
                            type="button"
                            onClick={handleRemoveMain}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-950 mx-auto md:mx-0"
                          >
                            <Trash2 className="w-4 h-4" /> Sil
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ek Fotoğraflar
              </Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "images")}
                className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 file:text-blue-500 file:bg-transparent file:border-none file:mr-4 file:cursor-pointer rounded-lg"
              />
              <div className="flex flex-wrap gap-3 mt-2">
                <AnimatePresence>
                  {post.images.map((img, i) => (
                    <motion.div
                      key={img}
                      className="relative w-24 h-24 rounded-xl overflow-hidden shadow-md group cursor-pointer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                    >
                      <img
                        src={img}
                        alt={`Ek Fotoğraf ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 bg-red-600/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                  {imageUploadStates.map((item) => (
                    <motion.div
                      key={item.id}
                      className="relative w-24 h-24 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-gray-200 dark:bg-gray-700"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                    >
                      {item.isUploading && (
                        <div className="flex flex-col items-center text-gray-600 dark:text-gray-400">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <span className="mt-1 text-xs font-semibold">
                            {item.progress}%
                          </span>
                          <span className="text-[10px] text-center mt-1 w-full truncate px-1">
                            {item.fileName}
                          </span>
                        </div>
                      )}
                      {item.isUploaded && (
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      )}
                      {item.error && (
                        <div className="flex flex-col items-center text-red-500">
                          <X className="w-10 h-10" />
                          <span className="mt-1 text-xs text-center">Hata</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Yeni alan: Yorumlara İzin Ver Checkbox'ı */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner">
            <Label
              htmlFor="commentsAllowed"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Yorumlara İzin Ver
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="commentsAllowed"
                checked={post.commentsAllowed}
                onChange={handleCommentsAllowedChange}
                className="h-6 w-6 rounded border-2 appearance-none cursor-pointer
        
        /* Light Mode: Varsayılan (Seçili değil) */
        border-gray-300 bg-gray-100
        
        /* Light Mode: Üzerine Gelindiğinde */
        hover:border-blue-500 hover:bg-blue-100 
        
        /* Light Mode: Seçili Olduğunda */
        checked:bg-blue-600 checked:border-blue-600 checked:ring-2 checked:ring-blue-600 checked:ring-offset-2
        
        /* Dark Mode: Varsayılan (Seçili değil) */
        dark:border-gray-700 dark:bg-gray-900 
        
        /* Dark Mode: Üzerine Gelindiğinde */
        dark:hover:border-blue-500 dark:hover:bg-blue-900
        
        /* Dark Mode: Seçili Olduğunda */
        dark:checked:bg-blue-600 dark:checked:border-blue-600 dark:checked:ring-2 dark:checked:ring-blue-600 dark:checked:ring-offset-2 dark:checked:ring-offset-gray-900

        transition-all ease-in-out
      "
              />
              <div className="w-[120px] text-right">
                <label
                  htmlFor="commentsAllowed"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {post.commentsAllowed ? "Açık" : "Kapalı"}
                </label>
              </div>
            </div>
          </div>

          {/* Mevcut 'show' checkbox'ı */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner">
            <Label
              htmlFor="show"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Yayında göstermek için
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show"
                checked={post.show}
                onChange={handleCheckboxChange}
                className="h-6 w-6 rounded border-2 appearance-none cursor-pointer
        
        /* Light Mode: Varsayılan (Seçili değil) */
        border-gray-300 bg-gray-100
        
        /* Light Mode: Üzerine Gelindiğinde */
        hover:border-blue-500 hover:bg-blue-100 
        
        /* Light Mode: Seçili Olduğunda */
        checked:bg-blue-600 checked:border-blue-600 checked:ring-2 checked:ring-blue-600 checked:ring-offset-2
        
        /* Dark Mode: Varsayılan (Seçili değil) */
        dark:border-gray-700 dark:bg-gray-900 
        
        /* Dark Mode: Üzerine Gelindiğinde */
        dark:hover:border-blue-500 dark:hover:bg-blue-900
        
        /* Dark Mode: Seçili Olduğunda */
        dark:checked:bg-blue-600 dark:checked:border-blue-600 dark:checked:ring-2 dark:checked:ring-blue-600 dark:checked:ring-offset-2 dark:checked:ring-offset-gray-900

        transition-all ease-in-out
      "
              />
              <div className="w-[120px] text-right">
                <label
                  htmlFor="show"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {post.show ? "Yayında" : "Yayında Değil"}
                </label>
              </div>
            </div>
          </div>

          <Button
            className="w-full h-12 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            onClick={handleSubmit}
            disabled={
              loading ||
              mainPhotoState?.isUploading ||
              imageUploadStates.some((s) => s.isUploading)
            }
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin w-5 h-5" /> Kaydediliyor...
              </span>
            ) : id ? (
              "Güncelle"
            ) : (
              "Kaydet"
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
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
