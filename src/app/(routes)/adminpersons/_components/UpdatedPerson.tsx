"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, forwardRef, useEffect, useRef } from "react";
import {
  Loader2,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Info,
  X,
} from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { useRouter } from "next/navigation";

// Basit bir `cn` yardımcı fonksiyonu
const cn = (...args: (string | undefined | null | false)[]) => {
  return args.filter(Boolean).join(" ");
};

type ButtonProps = {
  children: ReactNode;
  variant?: "default" | "outline" | "ghost";
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  children,
  className,
  variant = "default",
  type = "button",
  disabled = false,
  ...props
}: ButtonProps) => {
  const baseClasses =
    "flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2";

  let variantClasses = "";

  if (variant === "default") {
    variantClasses =
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md";
  } else if (variant === "outline") {
    variantClasses =
      "bg-transparent border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500";
  } else if (variant === "ghost") {
    variantClasses =
      "bg-transparent text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800";
  }

  const finalClasses = cn(baseClasses, variantClasses, className);

  return (
    <button type={type} className={finalClasses} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

type InputProps = ComponentPropsWithoutRef<"input">;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", className, ...props }, ref) => {
    const baseClasses =
      "w-full px-4 py-2 rounded-xl border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 transition-shadow";
    return (
      <input
        ref={ref}
        type={type}
        className={cn(baseClasses, className)}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// Bildirim türü tanımı
type Notification = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

// Bildirim bileşeni
const NotificationItem = ({
  id,
  message,
  type,
  onClose,
}: Notification & { onClose: (id: number) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000); // 5 saniye sonra bildirimi otomatik kapat
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const iconClasses = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
  };

  const iconComponent = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  }[type];

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl shadow-md transition-all duration-300 transform",
        type === "success"
          ? "bg-green-100 dark:bg-green-900 border-l-4 border-green-500"
          : type === "error"
          ? "bg-red-100 dark:bg-red-900 border-l-4 border-red-500"
          : "bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500"
      )}
    >
      <span className={iconClasses[type]}>{iconComponent}</span>
      <p className="text-gray-800 dark:text-gray-200 text-sm flex-1">
        {message}
      </p>
      <button
        onClick={() => onClose(id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
};

// Rol ve sınıf seçeneklerini Zod şemasında tanımla
const classes = z
  .enum(["Hazırlık", "1", "2", "3", "4", "5", "6", "7"])
  .refine(
    (val) => ["Hazırlık", "1", "2", "3", "4", "5", "6", "7"].includes(val),
    {
      message: "Bir seçim yapmak zorundasın.",
    }
  );

const roleSchema = z
  .object({
    title: z.string().min(1, { message: "Görevin başlığı zorunludur." }),
    organization: z.string().min(1, { message: "Kurum adı zorunludur." }),
    startDate: z
      .string()
      .refine((val) => !val || !isNaN(new Date(val).getTime()), {
        message: "Geçerli bir başlangıç tarihi girin.",
      }),
    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.endDate) {
        return true;
      }
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "Bitiş tarihi başlangıç tarihinden önce olamaz.",
      path: ["endDate"],
    }
  );

const schema = z.object({
  name: z.string().min(1, { message: "Ad alanı zorunludur." }),
  class: z
    .enum(["Hazırlık", "1", "2", "3", "4", "5", "6", "7"])
    .optional()
    .or(z.literal("")), // boş bırakılabilir
  department: z.string().optional(),

  photo: z
    .union([z.string().url("Geçerli bir URL girin."), z.literal("")])
    .optional(),
  roles: z
    .array(roleSchema)
    .min(1, { message: "En az bir rol eklemelisiniz." }),

  socialMedia: z
    .object({
      instagram: z
        .string()
        .url("Geçerli bir URL girin.")
        .or(z.literal(""))
        .transform((val) => (val === "" ? undefined : val))
        .optional(),
    })
    .optional(),
});

type FormData = z.infer<typeof schema>;

// Yeni Onay Modalı Bileşeni
type ConfirmModalProps = {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-950 rounded-2xl p-8 shadow-2xl max-w-sm w-full space-y-6 transform scale-100 transition-all duration-300">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {title}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {message}
        </p>
        <div className="flex gap-4 justify-end">
          <Button onClick={onCancel} variant="outline" className="w-full">
            İptal
          </Button>
          <Button
            onClick={onConfirm}
            variant="default"
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500 w-full"
          >
            Evet, Kaldır
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function UpdatedPerson({ person }: { person?: any }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [roleToRemove, setRoleToRemove] = useState<{
    index: number;
    title: string;
  } | null>(null);

  const router = useRouter();

  const [shouldRedirect, setShouldRedirect] = useState(false);
  useEffect(() => {
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        router.push("/adminpersons");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...person,
      class: person?.class ?? "",
      department: person?.department ?? "",
      socialMedia: {
        instagram: person?.socialMedia?.instagram ?? "",
      },
      roles:
        person?.roles?.map((role: any) => ({
          ...role,
          startDate: role.startDate
            ? new Date(role.startDate).toISOString().split("T")[0]
            : "",
          endDate: role.endDate
            ? new Date(role.endDate).toISOString().split("T")[0]
            : "",
        })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "roles",
  });

  const photoUrl = watch("photo");
  const roles = watch("roles");
  const instagramUrl = watch("socialMedia.instagram");

  const addNotification = (message: string, type: Notification["type"]) => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
    };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/persons/upload", true);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status === 200) {
            setValue("photo", data.url, { shouldValidate: true });
            addNotification("Fotoğraf başarıyla yüklendi!", "success");
          } else {
            const errorMessage =
              data.error || "Fotoğraf yüklenirken bir hata oluştu.";
            addNotification(errorMessage, "error");
          }
          setIsUploading(false);
          setUploadProgress(0);
        }
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Yükleme hatası:", error);
      addNotification("Beklenmedik bir hata oluştu.", "error");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemovePhoto = () => {
    setValue("photo", "", { shouldValidate: true });
    addNotification("Fotoğraf kaldırıldı.", "info");
  };

  const handleClearSocialMedia = () => {
    setValue("socialMedia.instagram", "", { shouldValidate: true });
    addNotification("Instagram URL'si başarıyla silindi.", "info");
  };

  const handleOpenConfirmModal = (index: number) => {
    const roleTitle = watch(`roles.${index}.title`);
    setRoleToRemove({ index, title: roleTitle });
    setShowConfirmModal(true);
  };

  const handleConfirmRemove = () => {
    if (roleToRemove) {
      remove(roleToRemove.index);
      addNotification(
        `${roleToRemove.title || "Rol"} başarıyla kaldırıldı.`,
        "success"
      );
      setRoleToRemove(null);
      setShowConfirmModal(false);
    }
  };

  const handleCancelRemove = () => {
    addNotification("Rol kaldırma işlemi iptal edildi.", "info");
    setRoleToRemove(null);
    setShowConfirmModal(false);
  };

  // UpdatedPerson.tsx dosyanızdaki onSubmit fonksiyonu
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      let url = "";
      let method = "";

      // Eğer bir 'person' objesi varsa, bu bir güncelleme işlemidir.
      if (person && person._id) {
        url = `/api/persons/${person._id}`;
        method = "PATCH";
      } else {
        // Eğer 'person' objesi yoksa, bu yeni bir ekleme işlemidir.
        url = `/api/persons`; // Yeni personel ekleme API'nızın adresi
        method = "POST";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData.error || "Form gönderilirken bir hata oluştu.";
        addNotification(errorMessage, "error");
        console.error("Form gönderme hatası:", responseData);
      } else {
        addNotification("Personel bilgileri başarıyla kaydedildi.", "success");
        setShouldRedirect(true);
      }
    } catch (err) {
      console.error("İstek hatası:", err);
      addNotification("Sunucuya bağlanılamadı.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-center sm:text-left">
          Personel {person ? "Güncelle" : "Ekle"} 📝
        </h2>
        <Button onClick={() => router.push("/adminpersons")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Geri
        </Button>
      </div>

      <div className="fixed top-8 right-8 z-50 space-y-2">
        {notifications.map((note) => (
          <NotificationItem
            key={note.id}
            id={note.id}
            message={note.message}
            type={note.type}
            onClose={removeNotification}
          />
        ))}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-6 md:p-10 lg:p-12 bg-white dark:bg-gray-950 rounded-2xl shadow-xl transition-colors duration-300 max-w-2xl mx-auto"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-blue-500 dark:border-blue-400 shadow-md flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Personel Fotoğrafı"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              />
            ) : (
              <svg
                className="w-24 h-24 text-gray-400 dark:text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 20.993c-.45-.733-1.636-1.92-2.585-2.868-1.077-1.078-2.618-1.423-4.136-1.423-1.517 0-3.058.345-4.136 1.423-.949.948-2.135 2.135-2.585 2.868-.582.946-1.517.946-2.1 0-.45-.733-1.636-1.92-2.585-2.868-1.077-1.078-2.618-1.423-4.136-1.423-1.517 0-3.058.345-4.136 1.423-.949.948-2.135 2.135-2.585 2.868-.582.946-.66.946-.66 0s-.078-1.92-.66-2.868c-.45-.733-1.636-1.92-2.585-2.868-1.077-1.078-2.618-1.423-4.136-1.423-1.517 0-3.058.345-4.136 1.423-.949.948-2.135 2.135-2.585 2.868-.582.946-1.517.946-2.1 0zM12 12c-3.313 0-6 2.687-6 6h12c0-3.313-2.687-6-6-6z" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
            <label
              htmlFor="photo-upload"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            >
              <span className="text-white text-sm font-semibold">
                Fotoğraf Değiştir
              </span>
              <input
                id="photo-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
                accept="image/*"
              />
            </label>
          </div>

          {isUploading && (
            <div className="flex flex-col items-center gap-2 w-full max-w-[200px] mt-2">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="text-blue-500 text-sm font-medium animate-pulse">
                Yükleniyor... (%{uploadProgress})
              </span>
            </div>
          )}

          {photoUrl && (
            <Button
              type="button"
              onClick={handleRemovePhoto}
              variant="ghost"
              className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Fotoğrafı Kaldır
            </Button>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Ad Soyad
            </label>
            <Input
              id="name"
              placeholder="Ör: Ali Veli"
              {...register("name")}
              className="rounded-xl border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="class"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Sınıf
            </label>
            <select
              id="class"
              {...register("class")}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            >
              <option value="">Sınıf Seçin</option>
              {["Hazırlık", "1", "2", "3", "4", "5", "6", "7"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.class && (
              <p className="text-red-500 text-xs mt-1">
                {errors.class.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Bölüm
            </label>
            <Input
              id="department"
              placeholder="Ör: Bilgi İşlem"
              {...register("department")}
              className="rounded-xl border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
          </div>

          <div className="col-span-2">
            <label
              htmlFor="instagram"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Instagram URL'si (Opsiyonel)
            </label>
            <div className="relative">
              <Input
                id="instagram"
                type="url"
                placeholder="Ör: https://instagram.com/kullanici_adi"
                {...register("socialMedia.instagram")}
                className="rounded-xl dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 transition-shadow pr-10"
              />
              {instagramUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClearSocialMedia}
                  className="absolute inset-y-0 right-0 flex items-center p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {errors.socialMedia?.instagram && (
              <p className="text-red-500 text-xs mt-1">
                {errors.socialMedia.instagram.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Roller
          </h3>
          {errors.roles && (
            <p className="text-red-500 text-sm">{errors.roles.message}</p>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-start gap-4 p-4 border rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <div className="grid flex-1 grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Görev
                  </label>
                  <Input
                    placeholder="Ör: Yazılım Geliştirici"
                    {...register(`roles.${index}.title`)}
                    className="rounded-xl dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600"
                  />
                  {errors.roles?.[index]?.title && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.roles[index].title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kurum
                  </label>
                  <Input
                    placeholder="Ör: ABC Şirketi"
                    {...register(`roles.${index}.organization`)}
                    className="rounded-xl dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600"
                  />
                  {errors.roles?.[index]?.organization && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.roles[index].organization.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Başlangıç Tarihi (Opsiyonel)
                  </label>
                  <Input
                    type="date"
                    {...register(`roles.${index}.startDate`)}
                    className="rounded-xl dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600"
                  />
                  {errors.roles?.[index]?.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.roles[index].startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bitiş Tarihi (Opsiyonel)
                  </label>
                  <Input
                    type="date"
                    {...register(`roles.${index}.endDate`)}
                    className="rounded-xl dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600"
                  />
                  {errors.roles?.[index]?.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.roles[index].endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 pt-1.5">
                <Button
                  type="button"
                  onClick={() => handleOpenConfirmModal(index)}
                  variant="ghost"
                  className="p-1 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            onClick={() =>
              append({
                title: "",
                organization: "",
                startDate: "",
                endDate: "",
              })
            }
            variant="outline"
            className="w-full text-blue-500 hover:text-blue-600 border-blue-500 hover:border-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Rol Ekle
          </Button>
        </div>

        <Button
          type="submit"
          className={cn(
            "w-full py-3 rounded-xl text-lg font-bold shadow-lg transition-transform transform hover:scale-105 duration-300",
            (isUploading || isSubmitting) && "opacity-50 cursor-not-allowed"
          )}
          disabled={isUploading || isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" /> Kaydediliyor...
            </span>
          ) : person ? (
            "Güncelle"
          ) : (
            "Kaydet"
          )}
        </Button>
      </form>

      {showConfirmModal && roleToRemove && (
        <ConfirmModal
          title="Rolü Kaldır"
          message={`"${
            roleToRemove.title || "Bu"
          }" rolünü kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
          onConfirm={handleConfirmRemove}
          onCancel={handleCancelRemove}
        />
      )}
    </div>
  );
}
