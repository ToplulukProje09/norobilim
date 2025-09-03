"use client";

import { useEffect, useState } from "react";
import { XCircle, PlusCircle, Save, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface MainMenuData {
  id?: string;
  titlePrimary: string;
  titleSecondary: string;
  mainLogo: string;
  mainPhoto: string;
  aboutParagraph: string;
  mainParagraph: string;
  socialLinks: string[];
  email?: string;
}

const initialData: MainMenuData = {
  titlePrimary: "",
  titleSecondary: "",
  mainLogo: "",
  mainPhoto: "",
  aboutParagraph: "",
  mainParagraph: "",
  socialLinks: [],
  email: "",
};

export default function AdminMainMenu() {
  const router = useRouter();
  const [data, setData] = useState<MainMenuData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/mainmenu");
        if (!res.ok) {
          throw new Error("Veri çekme hatası.");
        }
        const fetchedData: MainMenuData = await res.json();
        if (fetchedData) {
          setData({
            ...fetchedData,
            aboutParagraph: fetchedData.aboutParagraph || "",
            mainParagraph: fetchedData.mainParagraph || "",
            socialLinks: fetchedData.socialLinks || [],
            email: fetchedData.email || "",
          });
        }
        toast.success("Veriler başarıyla yüklendi!");
      } catch (err: any) {
        toast.error("Veriler yüklenirken bir hata oluştu: " + err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !data.titlePrimary.trim() ||
      !data.titleSecondary.trim() ||
      !data.mainLogo.trim()
    ) {
      toast.error(
        "Ana sayfa başlığı, hakkında başlığı ve logo boş bırakılamaz!"
      );
      return;
    }

    setIsSaving(true);

    try {
      const filteredData = {
        ...data,
        socialLinks: data.socialLinks.filter((link) => link.trim() !== ""),
      };

      const res = await fetch("/api/mainmenu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filteredData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Veri kaydetme hatası.");
      }

      const updatedData = await res.json();
      setData({
        ...updatedData,
        socialLinks: updatedData.socialLinks || [],
      });
      toast.success("Ayarlar başarıyla kaydedildi!");

      // --- Bu satırı ekleyin ---
      router.push("/admin");
    } catch (err: any) {
      // ...
      // ...
      toast.error("Kaydetme işlemi başarısız oldu: " + err.message);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...data.socialLinks];
    newLinks[index] = value;
    setData((prevData) => ({ ...prevData, socialLinks: newLinks }));
  };

  const handleAddSocialLink = () => {
    setData((prevData) => ({
      ...prevData,
      socialLinks: [...prevData.socialLinks, ""],
    }));
  };

  const handleRemoveSocialLink = (index: number) => {
    setData((prevData) => ({
      ...prevData,
      socialLinks: prevData.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (
    file: File,
    fieldName: "mainLogo" | "mainPhoto"
  ) => {
    if (!file) return;
    setIsSaving(true);
    const loadingToast = toast.loading("Resim yükleniyor...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/mainmenu/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Dosya yükleme hatası.");
      }

      const result = await res.json();
      const uploadedUrl = result.files?.[0]?.url;

      if (!uploadedUrl) {
        throw new Error("Yüklenen dosya için URL alınamadı.");
      }

      let existingRecord = await fetch("/api/mainmenu").then((r) => r.json());

      if (!existingRecord || !existingRecord.id) {
        const postRes = await fetch("/api/mainmenu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titlePrimary: data.titlePrimary || "Varsayılan Ana Sayfa Başlığı",
            titleSecondary:
              data.titleSecondary || "Varsayılan Hakkında Başlığı",
            mainLogo:
              fieldName === "mainLogo" ? uploadedUrl : data.mainLogo || "",
            mainPhoto:
              fieldName === "mainPhoto" ? uploadedUrl : data.mainPhoto || "",
            aboutParagraph: data.aboutParagraph || "",
            mainParagraph: data.mainParagraph || "",
            socialLinks: data.socialLinks,
            email: data.email || "",
          }),
        });

        if (!postRes.ok) {
          const postErrData = await postRes.json();
          throw new Error(postErrData.error || "İlk kayıt oluşturulamadı.");
        }
        existingRecord = await postRes.json();
      }

      const updateRes = await fetch("/api/mainmenu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [fieldName]: uploadedUrl }),
      });

      if (!updateRes.ok) {
        const errData = await updateRes.json();
        throw new Error(errData.error || "URL güncelleme hatası.");
      }

      setData((prevData) => ({ ...prevData, [fieldName]: uploadedUrl }));
      toast.success("Resim başarıyla güncellendi!", { id: loadingToast });
    } catch (err: any) {
      toast.error("Resim yüklenirken hata oluştu: " + err.message, {
        id: loadingToast,
      });
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "mainLogo" | "mainPhoto"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, fieldName);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <div className="text-xl font-medium">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-12 flex justify-center items-start bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      <Toaster position="top-right" reverseOrder={false} />
      <Card className="w-full max-w-5xl rounded-2xl shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <CardHeader className="text-center p-6">
          <div className="flex flex-col md:flex-row md:justify-center md:items-center w-full relative">
            <div className="w-full text-left md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 md:w-auto">
              <Button
                variant="ghost"
                onClick={() => router.push("/admin")}
                className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:bg-transparent hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-base font-semibold">Geri</span>
              </Button>
            </div>
            <div className="flex-grow text-center mt-2 md:mt-0">
              <CardTitle className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                Site Ayarları
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-lg mt-2 text-slate-600 dark:text-slate-400">
            Sitenin ana menü ve 'Hakkında' sayfası içeriklerini yönetin.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-200 dark:border-indigo-800 pb-2">
                Genel Ayarlar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col space-y-2 col-span-1">
                  <label
                    htmlFor="titleSecondary"
                    className="font-semibold text-sm text-slate-700 dark:text-slate-300"
                  >
                    Alt Başlık
                  </label>
                  <Input
                    id="titleSecondary"
                    type="text"
                    name="titleSecondary"
                    value={data.titleSecondary}
                    onChange={handleInputChange}
                    placeholder="Hakkında sayfası başlığı"
                    className="rounded-lg border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col space-y-4 items-center col-span-1">
                  <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                    Ana Logo
                  </label>
                  {data.mainLogo && (
                    <img
                      src={data.mainLogo}
                      alt="Logo"
                      className="w-24 h-24 object-contain mb-2 rounded-xl shadow-lg border border-slate-300 dark:border-slate-700 p-2"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "mainLogo")}
                    className="file:text-white file:bg-indigo-600 file:border-0 file:rounded-full file:px-4 file:py-2 file:cursor-pointer hover:file:bg-indigo-700 transition-colors"
                  />
                </div>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            <section>
              <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-200 dark:border-indigo-800 pb-2">
                Ana Sayfa Ayarları
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="flex flex-col space-y-2 col-span-1 md:col-span-2">
                  <label
                    htmlFor="titlePrimary"
                    className="font-semibold text-sm text-slate-700 dark:text-slate-300"
                  >
                    Ana Sayfa Başlığı
                  </label>
                  <Input
                    id="titlePrimary"
                    type="text"
                    name="titlePrimary"
                    value={data.titlePrimary}
                    onChange={handleInputChange}
                    placeholder="Sitenizin ana başlığı"
                    className="rounded-lg border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col space-y-2 col-span-1 md:col-span-2">
                  <label
                    htmlFor="mainParagraph"
                    className="font-semibold text-sm text-slate-700 dark:text-slate-300"
                  >
                    Ana Sayfa Paragrafı
                  </label>
                  <Textarea
                    id="mainParagraph"
                    name="mainParagraph"
                    value={data.mainParagraph}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Sitenizin ana sayfasındaki kısa açıklama metni."
                    className="rounded-lg border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col space-y-4 col-span-1 md:col-span-2 items-center">
                  <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                    Ana Menü Fotoğrafı
                  </label>
                  {data.mainPhoto && (
                    <img
                      src={data.mainPhoto}
                      alt="Main"
                      className="w-full h-64 object-cover mb-2 rounded-xl shadow-lg border border-slate-300 dark:border-slate-700"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "mainPhoto")}
                    className="file:text-white file:bg-indigo-600 file:border-0 file:rounded-full file:px-4 file:py-2 file:cursor-pointer hover:file:bg-indigo-700 transition-colors"
                  />
                </div>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            <section>
              <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-200 dark:border-indigo-800 pb-2">
                "Hakkında" Sayfası Ayarları
              </h2>
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="aboutParagraph"
                  className="font-semibold text-sm text-slate-700 dark:text-slate-300"
                >
                  Hakkında Paragrafı
                </label>
                <Textarea
                  id="aboutParagraph"
                  name="aboutParagraph"
                  value={data.aboutParagraph}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Kendinizi, işinizi veya şirketinizi anlatın."
                  className="rounded-lg border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            <section>
              <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-200 dark:border-indigo-800 pb-2">
                İletişim ve Sosyal Medya
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="email"
                    className="font-semibold text-sm text-slate-700 dark:text-slate-300"
                  >
                    E-posta Adresi
                  </label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={data.email || ""}
                    onChange={handleInputChange}
                    placeholder="iletisim@example.com"
                    className="rounded-lg border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                      Sosyal Medya Linkleri
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={handleAddSocialLink}
                            variant="outline"
                            size="sm"
                            className="rounded-full border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-slate-800 transition-colors"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Yeni sosyal medya linki ekle</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="space-y-3">
                    {data.socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          type="url"
                          value={link}
                          onChange={(e) =>
                            handleSocialLinkChange(index, e.target.value)
                          }
                          placeholder="https://..."
                          className="flex-1 rounded-lg border-slate-300 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                        {data.socialLinks.length > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  onClick={() => handleRemoveSocialLink(index)}
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-white hover:bg-red-500 dark:hover:text-red-500 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <XCircle className="w-5 h-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Linki kaldır</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="text-center mt-12">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full h-14 font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 mr-3" />
                    Tümünü Kaydet
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
