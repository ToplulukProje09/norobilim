"use client";

import { useEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Edit,
  PlusCircle,
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Image as ImageIcon,
  Info,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Event, EventDay } from "@/types/db";

/* -------------------- Error Modal -------------------- */
type ErrorModalProps = {
  message: string;
  onClose: () => void;
};
const ErrorModal = memo<ErrorModalProps>(({ message, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-sm text-center">
      <div className="flex items-center justify-center mb-4">
        <XCircle className="w-16 h-16 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-red-600 mb-2">Hata!</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      <Button onClick={onClose} variant="outline" className="w-full">
        Tamam
      </Button>
    </div>
  </div>
));

/* -------------------- Loading Spinner -------------------- */
const LoadingSpinner = memo(() => (
  <div className="flex min-h-screen items-center justify-center p-4 bg-background">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
      <p className="text-xl text-muted-foreground font-semibold">
        Etkinlikler yükleniyor...
      </p>
    </div>
  </div>
));

/* -------------------- Tarih Formatlama -------------------- */
function formatEventDay(day: EventDay) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const date = new Date(day.date);
  const formattedDate = date.toLocaleDateString("tr-TR", dateOptions);
  const formattedStartTime = day.startTime;
  const formattedEndTime = day.endTime ? ` - ${day.endTime}` : "";
  return {
    date: formattedDate,
    time: formattedStartTime + formattedEndTime,
  };
}

/* -------------------- Ana Bileşen -------------------- */
const ShowEvents = ({ events: initialEvents }: { events: Event[] }) => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingEvent, setUpdatingEvent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "upcoming" | "happened"
  >("all");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const openLightbox = (img: string) => setLightboxImage(img);
  const closeLightbox = () => setLightboxImage(null);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  async function deleteEvent(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Etkinlik silme işlemi başarısız oldu.");
      setEvents((prev) => prev.filter((e) => e._id !== id));
      router.refresh();
    } catch {
      setError("Etkinlik silinirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDidItHappenChange(eventId: string, newValue: boolean) {
    setUpdatingEvent(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ didItHappen: newValue }),
      });
      if (!res.ok) throw new Error("Etkinlik durumu güncellenemedi.");
      const updatedEvent = await res.json();
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? updatedEvent : e))
      );
    } catch {
      setError("Etkinlik durumu güncellenirken bir hata oluştu.");
    } finally {
      setUpdatingEvent(null);
    }
  }

  const handleEdit = (eventId: string) =>
    router.push(`/adminevents/${eventId}`);

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "upcoming" && e.didItHappen === false) ||
      (filterStatus === "happened" && e.didItHappen === true);
    return matchesSearch && matchesFilter;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-background text-foreground">
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}

      {/* Başlık ve Butonlar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 space-y-4 sm:space-y-0">
        <h1 className="text-4xl font-extrabold tracking-tight text-center sm:text-left">
          Etkinlik Yönetimi 🎉
        </h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/admin")}
            variant="outline"
            className="group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />{" "}
            Geri Dön
          </Button>
          <Button
            onClick={() => router.push("/adminevents/new")}
            className="group"
          >
            <PlusCircle className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />{" "}
            Yeni Etkinlik Ekle
          </Button>
        </div>
      </div>
      <Separator className="mb-6" />

      {/* Arama ve Filtre */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Etkinlik ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2"
          />
        </div>
        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
          <Badge
            className={`cursor-pointer transition-colors border-2 px-3 py-1 ${
              filterStatus === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
            }`}
            onClick={() => setFilterStatus("all")}
          >
            Tümü
          </Badge>
          <Badge
            className={`cursor-pointer transition-colors border-2 px-3 py-1 ${
              filterStatus === "upcoming"
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-transparent hover:bg-blue-200 dark:hover:bg-blue-800"
            }`}
            onClick={() => setFilterStatus("upcoming")}
          >
            Yaklaşanlar
          </Badge>
          <Badge
            className={`cursor-pointer transition-colors border-2 px-3 py-1 ${
              filterStatus === "happened"
                ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-transparent hover:bg-green-200 dark:hover:bg-green-800"
            }`}
            onClick={() => setFilterStatus("happened")}
          >
            Gerçekleşenler
          </Badge>
        </div>
      </div>

      {/* Etkinlikler */}
      {filteredEvents.length === 0 && events.length === 0 ? (
        <div className="text-center md:col-span-full py-12 flex flex-col items-center justify-center space-y-4">
          <h3 className="text-2xl font-bold text-muted-foreground">
            Henüz hiç etkinlik eklenmemiş. 😔
          </h3>
          <p className="text-xl text-muted-foreground">
            Yeni bir etkinlik ekleyerek başlayabilirsiniz.
          </p>
          <Button
            onClick={() => router.push("/adminevents/new")}
            size="lg"
            className="mt-6"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Etkinlik Ekle
          </Button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center md:col-span-full py-12 flex flex-col items-center justify-center space-y-4">
          <h3 className="text-2xl font-bold text-muted-foreground">
            😔 Üzgünüz,
          </h3>
          <p className="text-xl text-muted-foreground">
            Arama kriterlerinize uygun bir etkinlik bulunamadı.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredEvents.map((e) => (
            <Card
              key={e._id}
              className="flex flex-col h-full overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
            >
              <CardHeader className="flex flex-col items-center p-4 pb-2">
                <div className="relative w-full aspect-video rounded-md mb-4 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  {e.image ? (
                    <Image
                      src={e.image}
                      alt={e.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-110 rounded-md"
                    />
                  ) : (
                    <ImageIcon className="w-20 h-20 text-gray-400 dark:text-gray-600" />
                  )}
                </div>
                <div className="text-center w-full">
                  <CardTitle className="line-clamp-2 text-xl font-bold">
                    {e.title}
                  </CardTitle>
                  <CardDescription className="flex flex-col items-center justify-center space-y-1 mt-1 text-center">
                    <Badge
                      variant="secondary"
                      className="text-xs flex items-center gap-1"
                    >
                      <MapPin className="h-3 w-3" />
                      {e.location}
                    </Badge>
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pt-4 flex-grow">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {e.description}
                </p>

                {/* Etkinlik Günleri */}
                {e.eventDays && e.eventDays.length > 0 && (
                  <div className="border-t border-dashed pt-3 border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-lg text-primary mb-2 flex items-center gap-1">
                      <CalendarDays className="h-5 w-5" /> Tarihler
                    </h4>
                    <div className="flex flex-col gap-2">
                      {e.eventDays.map((day, index) => {
                        const { date, time } = formatEventDay(day);
                        return (
                          <div
                            key={day._id || `${e._id}-day-${index}`}
                            className="p-3 rounded-xl bg-secondary/30 transition-colors duration-200 hover:bg-secondary/50 border border-secondary/50"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-bold text-foreground text-sm">
                                  {date}
                                </span>
                              </div>
                              <Badge className="bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold px-2 py-1">
                                {time}
                              </Badge>
                            </div>
                            {day.details && (
                              <div className="mt-2 pt-2 border-t border-dashed border-secondary/50">
                                <h5 className="font-semibold text-sm flex items-center gap-1 text-primary">
                                  <Info className="h-4 w-4" /> Detaylar
                                </h5>
                                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                                  {day.details
                                    .split("\n")
                                    .filter(Boolean)
                                    .map((detail, detailIndex) => (
                                      <li key={detailIndex}>{detail.trim()}</li>
                                    ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ek Fotoğraflar */}
                {e.eventImages && e.eventImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-primary mb-2 flex items-center gap-1">
                      <ImageIcon className="h-5 w-5" /> Ek Fotoğraflar
                    </h4>
                    <div className="flex flex-wrap gap-2 py-2">
                      {e.eventImages.map((img, index) => (
                        <div
                          key={`${e._id}-img-${index}`}
                          className="relative flex-shrink-0 w-32 sm:w-40 aspect-video rounded-md overflow-hidden border-2 border-gray-300 dark:border-gray-700 cursor-pointer"
                          onClick={() => openLightbox(img)}
                        >
                          <Image
                            src={img}
                            alt={`Ek fotoğraf ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-end p-4 pt-0 gap-3">
                <Button
                  onClick={() => handleEdit(e._id)}
                  variant="secondary"
                  className="group flex-grow sm:flex-grow-0 text-xs sm:text-sm"
                >
                  <Edit className="h-4 w-4 mr-1 sm:mr-2 transition-transform group-hover:rotate-12" />{" "}
                  <span className="hidden sm:inline">Tümünü Düzenle</span>
                  <span className="sm:hidden">Düzenle</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex-grow sm:flex-grow-0 text-xs sm:text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />{" "}
                      <span className="hidden sm:inline">Sil</span>
                      <span className="sm:hidden">Sil</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Bu etkinliği silmek istediğine emin misin?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu işlem geri alınamaz. Etkinlik kalıcı olarak
                        silinecektir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteEvent(e._id)}>
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-[90vw] max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-white text-2xl font-bold z-10"
              onClick={closeLightbox}
            >
              &times;
            </button>
            <Image
              src={lightboxImage}
              alt="Büyütülmüş fotoğraf"
              width={800}
              height={600}
              className="object-contain w-full h-auto rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowEvents;
