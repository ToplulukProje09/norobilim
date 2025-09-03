// /components/UpdateEvents.tsx

"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, forwardRef, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; // Added router import
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
  CalendarDays,
  MapPin,
  Globe,
  Image as ImageIcon,
} from "lucide-react";
import {
  ButtonHTMLAttributes,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import type { Event, EventDay } from "@/types/event";

// Basit bir `cn` yardımcı fonksiyonu
const cn = (...args: (string | undefined | null | false)[]) => {
  return args.filter(Boolean).join(" ");
};

// UpdatedPerson.tsx'ten alınan Button bileşeni
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

// UpdatedPerson.tsx'ten alınan Input bileşeni
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

// Yeni Textarea bileşeni
type TextareaProps = ComponentPropsWithoutRef<"textarea">;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const baseClasses =
      "flex min-h-[80px] w-full rounded-xl border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 transition-shadow p-4";
    return (
      <textarea className={cn(baseClasses, className)} ref={ref} {...props} />
    );
  }
);
Textarea.displayName = "Textarea";

// Yeni Checkbox bileşeni
type CheckboxProps = ComponentPropsWithoutRef<"input"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, checked, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
    };
    return (
      <input
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
          className
        )}
        ref={ref}
        checked={checked}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";

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
    }, 5000);
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
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Zod Şeması
const eventDaySchema = z
  .object({
    date: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Geçerli bir tarih girin.",
    }),
    startTime: z.string().min(1, "Başlangıç saati zorunludur."),
    endTime: z.string().optional(),
    details: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const start = parseInt(data.startTime.replace(":", ""));
        const end = parseInt(data.endTime.replace(":", ""));
        return end > start;
      }
      return true;
    },
    {
      message: "Bitiş saati başlangıç saatinden sonra olmalıdır.",
      path: ["endTime"],
    }
  );

const eventSchema = z.object({
  title: z.string().min(1, { message: "Başlık zorunludur." }),
  description: z.string().min(1, { message: "Açıklama zorunludur." }),
  image: z.string().url("Geçerli bir URL girin.").optional().or(z.literal("")),
  location: z.string().min(1, { message: "Konum zorunludur." }),
  isOnline: z.boolean().default(false),
  didItHappen: z.boolean().default(false),
  // Değişiklikler burada: Alanlar artık sayısal zorunluluğa sahip değil.
  numberOfAttendees: z.number().int().min(0).optional().or(z.literal(null)),
  estimatedAttendees: z.number().int().min(0).optional().or(z.literal(null)),
  eventImages: z.array(z.string().url("Geçerli bir URL girin.")).optional(),
  eventDays: z
    .array(eventDaySchema)
    .min(1, "En az bir etkinlik tarihi eklemelisiniz."),
});

type FormData = z.infer<typeof eventSchema>;

interface UpdateEventsProps {
  event?: Event;
  onSaved?: (savedEvent: Event) => void;
  onCancel?: () => void;
}

const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
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
            <X className="h-6 w-6" />
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

export default function UpdateEvents({
  event,
  onSaved,
  onCancel,
}: UpdateEventsProps) {
  const [isCoverImageUploading, setIsCoverImageUploading] = useState(false);
  const [isEventImagesUploading, setIsEventImagesUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImageUploadProgress, setCoverImageUploadProgress] = useState(0);
  const [eventImagesUploadProgress, setEventImagesUploadProgress] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dayToRemove, setDayToRemove] = useState<{
    index: number;
    date: string;
  } | null>(null);

  // Ek fotoğraflar için yeni durum değişkenleri
  const [uploadedFileCount, setUploadedFileCount] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter(); // Initialize the router

  const defaultValues = {
    title: event?.title || "",
    description: event?.description || "",
    image: event?.image || "",
    location: event?.location !== "Online" ? event?.location || "" : "",
    isOnline: event?.location === "Online",
    didItHappen: event?.didItHappen || false,
    // Değişiklikler burada: Alanlar artık sayısal zorunluluğa sahip değil.
    numberOfAttendees: event?.numberOfAttendees ?? null,
    estimatedAttendees: event?.estimatedAttendees ?? null,
    eventImages: event?.eventImages || [],
    eventDays:
      event?.eventDays?.map((day) => ({
        date: day.date ? new Date(day.date).toISOString().split("T")[0] : "",
        startTime: day.startTime,
        endTime: day.endTime || "",
        details: day.details || "",
      })) || [],
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "eventDays",
  });

  const image = watch("image");
  const eventImages = watch("eventImages");
  const isOnline = watch("isOnline");
  const didItHappen = watch("didItHappen");

  useEffect(() => {
    if (didItHappen) {
      setValue("estimatedAttendees", null, { shouldDirty: true });
    } else {
      setValue("numberOfAttendees", null, { shouldDirty: true });
    }
  }, [didItHappen, setValue]);

  useEffect(() => {
    if (isOnline) {
      setValue("location", "Online", { shouldDirty: true });
    } else if (watch("location") === "Online") {
      setValue("location", "", { shouldDirty: true });
    }
  }, [isOnline, setValue, watch]);

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

    setIsCoverImageUploading(true);
    setCoverImageUploadProgress(0);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/events/upload", true);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setCoverImageUploadProgress(percent);
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          setIsCoverImageUploading(false);
          setCoverImageUploadProgress(0);
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              const newUrls = Array.isArray(data.urls) ? data.urls : [];
              if (newUrls.length > 0) {
                setValue("image", newUrls[0], { shouldValidate: true });
                addNotification(
                  "Kapak fotoğrafı başarıyla yüklendi!",
                  "success"
                );
              }
            } catch (error) {
              console.error("JSON parse hatası:", error);
              addNotification(
                "Sunucudan gelen yanıt işlenirken bir hata oluştu.",
                "error"
              );
            }
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              const errorMessage =
                data.error || "Fotoğraf yüklenirken bir hata oluştu.";
              addNotification(errorMessage, "error");
            } catch {
              addNotification(
                "Fotoğraf yüklenirken beklenmedik bir hata oluştu.",
                "error"
              );
            }
          }
        }
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Yükleme hatası:", error);
      addNotification("Ağ bağlantısı hatası.", "error");
      setIsCoverImageUploading(false);
      setCoverImageUploadProgress(0);
    }
  };

  const handleEventImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.length) return;

    const files = Array.from(e.target.files);
    setIsEventImagesUploading(true);
    setTotalFiles(files.length);
    setUploadedFileCount(0);

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("files", file);

      try {
        const res = await fetch("/api/events/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Yükleme başarısız oldu.");
        }

        const data = await res.json();
        uploadedUrls.push(data.urls[0]);
        setUploadedFileCount((prev) => prev + 1);
      } catch (error) {
        console.error("Yükleme hatası:", error);
        addNotification(`Fotoğraf yüklenirken hata: ${file.name}`, "error");
      }
    }

    setIsEventImagesUploading(false);
    setEventImagesUploadProgress(0);
    setUploadedFileCount(0);
    setTotalFiles(0);

    if (uploadedUrls.length > 0) {
      setValue("eventImages", [...(eventImages || []), ...uploadedUrls], {
        shouldValidate: true,
      });
      addNotification(
        `${uploadedUrls.length} fotoğraf başarıyla yüklendi!`,
        "success"
      );
    } else {
      addNotification("Hiçbir fotoğraf yüklenemedi.", "error");
    }
  };

  const handleRemovePhoto = () => {
    setValue("image", "", { shouldValidate: true });
    addNotification("Kapak fotoğrafı kaldırıldı.", "info");
  };

  const handleRemoveEventImage = (index: number) => {
    const updatedImages = eventImages?.filter((_, i) => i !== index);
    setValue("eventImages", updatedImages, { shouldDirty: true });
    addNotification("Ek fotoğraf kaldırıldı.", "info");
  };

  const handleOpenConfirmModal = (index: number) => {
    const date = watch(`eventDays.${index}.date`);
    setDayToRemove({ index, date });
    setShowConfirmModal(true);
  };

  const handleConfirmRemove = () => {
    if (dayToRemove) {
      remove(dayToRemove.index);
      addNotification(
        `${dayToRemove.date || "Etkinlik tarihi"} başarıyla kaldırıldı.`,
        "success"
      );
      setDayToRemove(null);
      setShowConfirmModal(false);
    }
  };

  const handleCancelRemove = () => {
    addNotification("Etkinlik tarihi kaldırma işlemi iptal edildi.", "info");
    setDayToRemove(null);
    setShowConfirmModal(false);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const formattedData = {
      ...data,
      eventDays: data.eventDays.map((day) => ({
        ...day,
        date: new Date(day.date).toISOString(),
      })),
      didItHappen: data.didItHappen,
      // Bu alanlar null olarak işleniyor
      numberOfAttendees: data.didItHappen ? data.numberOfAttendees : null,
      estimatedAttendees: !data.didItHappen ? data.estimatedAttendees : null,
      eventImages: data.eventImages || [],
    };

    console.log("Gönderilen veriler:", formattedData);

    try {
      let res;
      if (event) {
        res = await fetch(`/api/events/${event.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        });
      } else {
        res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        });
      }

      if (!res.ok) {
        const responseData = await res.json();
        const errorMessage =
          responseData.error || "Form gönderilirken bir hata oluştu.";
        addNotification(errorMessage, "error");
        console.error("Form gönderme hatası:", responseData);
      } else {
        const savedEvent: Event = await res.json();
        addNotification("Etkinlik bilgileri başarıyla kaydedildi.", "success");
        setTimeout(() => {
          if (onSaved) {
            onSaved(savedEvent);
          } else {
            // Default navigation if onSaved is not provided
            router.push("/adminevents");
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Form gönderme hatası:", error);
      addNotification("Ağ bağlantısı hatası.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Etkinlik {event ? "Güncelle" : "Ekle"} 📝
        </h2>
        {/* Changed `onCancel` to `router.back()` for direct navigation */}
        <Button onClick={() => router.push("/adminevents")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Geri
        </Button>
      </div>

      {/* Bildirim Alanı */}
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
        onSubmit={handleSubmit((data: FormData) => onSubmit(data))}
        className="space-y-8 p-6 md:p-10 lg:p-12 bg-white dark:bg-gray-950 rounded-2xl shadow-xl transition-colors duration-300 max-w-2xl mx-auto"
      >
        {/* Kapak Fotoğrafı */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Kapak Fotoğrafı
          </h3>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-lg h-52 md:h-64 rounded-xl overflow-hidden border-4 border-blue-500 dark:border-blue-400 shadow-md flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
              {image ? (
                <img
                  src={image}
                  alt="Etkinlik Kapak Fotoğrafı"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                />
              ) : (
                <ImageIcon className="w-24 h-24 text-gray-400 dark:text-gray-600" />
              )}
              <label
                htmlFor="image-upload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              >
                <span className="text-white text-sm font-semibold">
                  Fotoğraf Değiştir
                </span>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isCoverImageUploading}
                  accept="image/*"
                />
              </label>
            </div>

            {isCoverImageUploading && (
              <div className="flex flex-col items-center gap-2 w-full max-w-[200px] mt-2">
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${coverImageUploadProgress}%` }}
                  ></div>
                </div>
                <span className="text-blue-500 text-sm font-medium animate-pulse">
                  Yükleniyor... (%{coverImageUploadProgress})
                </span>
              </div>
            )}

            {image && (
              <Button
                type="button"
                onClick={handleRemovePhoto}
                variant="ghost"
                className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Kapak Fotoğrafını Kaldır
              </Button>
            )}
          </div>
        </div>

        {/* Ek Etkinlik Fotoğrafları */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Ek Etkinlik Fotoğrafları
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Etkinlikten birden fazla fotoğraf ekleyebilirsiniz.
          </p>
          <div className="flex flex-wrap gap-4">
            {eventImages &&
              eventImages.map((img, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700 group"
                >
                  <img
                    src={img}
                    alt={`Etkinlik fotoğrafı ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveEventImage(index)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white"
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>
              ))}
            <div className="relative w-24 h-24 flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <Plus className="h-8 w-8 text-gray-400 dark:text-gray-600" />
              <input
                type="file"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleEventImagesUpload}
                disabled={isEventImagesUploading}
                accept="image/*"
              />
            </div>
          </div>
          {isEventImagesUploading && (
            <div className="flex flex-col items-center gap-2 w-full max-w-[200px] mt-2">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${(uploadedFileCount / totalFiles) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="text-blue-500 text-sm font-medium animate-pulse">
                Yükleniyor... ({uploadedFileCount}/{totalFiles})
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="col-span-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Başlık
            </label>
            <Input
              id="title"
              placeholder="Ör: Girişimcilik Zirvesi"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Açıklama
            </label>
            <Textarea
              id="description"
              placeholder="Etkinlik hakkında detaylı bilgi girin..."
              {...register("description")}
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <div className="border border-gray-300 dark:border-gray-700 p-4 rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="didItHappen"
                  {...register("didItHappen")}
                  checked={didItHappen}
                  onCheckedChange={(checked) => {
                    setValue("didItHappen", checked as boolean);
                  }}
                />
                <label
                  htmlFor="didItHappen"
                  className={cn(
                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    didItHappen
                      ? "text-green-600 dark:text-green-400"
                      : "text-blue-600 dark:text-blue-400"
                  )}
                >
                  {didItHappen ? "Etkinlik Gerçekleşti" : "Etkinlik Yakında"}
                </label>
              </div>
            </div>
            {didItHappen ? (
              <div className="mt-2">
                <label
                  htmlFor="numberOfAttendees"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Katılımcı Sayısı (Opsiyonel)
                </label>
                <Input
                  id="numberOfAttendees"
                  type="number"
                  placeholder="Gerçekleşen katılımcı sayısı"
                  {...register("numberOfAttendees", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? null : parseFloat(v)),
                  })}
                />
                {errors.numberOfAttendees && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.numberOfAttendees.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-2">
                <label
                  htmlFor="estimatedAttendees"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Tahmini Katılımcı Sayısı (Opsiyonel)
                </label>
                <Input
                  id="estimatedAttendees"
                  type="number"
                  placeholder="Tahmini katılımcı sayısı"
                  {...register("estimatedAttendees", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? null : parseFloat(v)),
                  })}
                />
                {errors.estimatedAttendees && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.estimatedAttendees.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="col-span-2">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Konum
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="location"
                placeholder="Ör: Konferans Salonu"
                {...register("location")}
                disabled={isOnline}
                className={cn(
                  isOnline && "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                )}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isOnline"
                  checked={isOnline}
                  onCheckedChange={(checked) =>
                    setValue("isOnline", checked as boolean)
                  }
                />
                <label htmlFor="isOnline" className="text-sm font-medium">
                  Online
                </label>
              </div>
            </div>
            {errors.location && (
              <p className="text-red-500 text-xs mt-1">
                {errors.location.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Etkinlik Günleri
          </h3>
          {errors.eventDays && (
            <p className="text-red-500 text-sm">{errors.eventDays.message}</p>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tarih
                  </label>
                  <Input
                    type="date"
                    {...register(`eventDays.${index}.date`)}
                    className="rounded-xl dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 text-sm"
                  />
                  {errors.eventDays?.[index]?.date && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.eventDays[index].date.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Başlangıç Saati
                    </label>
                    <Input
                      type="time"
                      {...register(`eventDays.${index}.startTime`)}
                      className="rounded-xl dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 text-sm"
                    />
                    {errors.eventDays?.[index]?.startTime && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.eventDays[index].startTime.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bitiş Saati (Opsiyonel)
                    </label>
                    <Input
                      type="time"
                      {...register(`eventDays.${index}.endTime`)}
                      className="rounded-xl dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 text-sm"
                    />
                    {errors.eventDays?.[index]?.endTime && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.eventDays[index].endTime.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Detaylar (Her satır yeni madde olur)
                  </label>
                  <Textarea
                    placeholder="Ör: Konuşmacı: Ali Veli&#10;Atölye: Yapay Zeka"
                    {...register(`eventDays.${index}.details`)}
                    rows={1}
                    className="rounded-xl dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 text-sm"
                  />
                </div>
              </div>

              <div className="flex-shrink-0 self-center sm:self-start pt-1.5">
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
              append({ date: "", startTime: "", endTime: "", details: "" })
            }
            variant="outline"
            className="w-full text-blue-500 hover:text-blue-600 border-blue-500 hover:border-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Etkinlik Günü Ekle
          </Button>
        </div>

        <Button
          type="submit"
          className={cn(
            "w-full py-3 rounded-xl text-lg font-bold shadow-lg transition-transform transform hover:scale-105 duration-300",
            (isCoverImageUploading || isEventImagesUploading || isSubmitting) &&
              "opacity-50 cursor-not-allowed"
          )}
          disabled={
            isCoverImageUploading || isEventImagesUploading || isSubmitting
          }
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" /> Kaydediliyor...
            </span>
          ) : event ? (
            "Güncelle"
          ) : (
            "Kaydet"
          )}
        </Button>
      </form>

      {showConfirmModal && dayToRemove && (
        <ConfirmModal
          title="Etkinlik Gününü Kaldır"
          message={`"${
            dayToRemove.date || "Bu"
          }" etkinliği gününü kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
          onConfirm={handleConfirmRemove}
          onCancel={handleCancelRemove}
        />
      )}
    </div>
  );
}
