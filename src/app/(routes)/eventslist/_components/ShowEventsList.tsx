"use client";

import { useState, memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  CalendarDays,
  MapPin,
  Image as ImageIcon,
  Info,
  Loader2,
  Search,
  ArrowLeft,
} from "lucide-react";
import type { Event, EventDay } from "@/types/event";

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
  return { date: formattedDate, time: formattedStartTime + formattedEndTime };
}

/* -------------------- Ana Bileşen -------------------- */
const ShowEventsList = ({ events: initialEvents }: { events: Event[] }) => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "upcoming" | "happened"
  >("all");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const openLightbox = (img: string) => setLightboxImage(img);
  const closeLightbox = () => setLightboxImage(null);

  useEffect(() => setEvents(initialEvents), [initialEvents]);

  if (loading) return <LoadingSpinner />;

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "upcoming" && !e.didItHappen) ||
      (filterStatus === "happened" && e.didItHappen);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-background text-foreground">
      {/* Başlık ve Geri Butonu */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-center sm:text-left">
          Etkinlikler 🎉
        </h1>
        <button
          className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" /> Geri
        </button>
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
                ? "bg-yellow-400 text-yellow-900 border-yellow-400 hover:bg-yellow-500"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-transparent hover:bg-yellow-200 dark:hover:bg-yellow-800"
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
      {filteredEvents.length === 0 ? (
        <p className="text-center text-xl text-muted-foreground">
          Arama kriterlerinize uygun etkinlik bulunamadı.
        </p>
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

                <CardTitle className="line-clamp-2 text-xl font-bold text-center">
                  {e.title}
                </CardTitle>

                {/* Etkinlik durumu */}
                <span
                  className={`mt-2 inline-block px-3 py-1 text-sm font-semibold rounded-full shadow-md ${
                    e.didItHappen
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900"
                  }`}
                >
                  {e.didItHappen ? "Gerçekleşti" : "Yakında"}
                </span>

                <CardDescription className="flex flex-col items-center justify-center space-y-1 mt-1 text-center">
                  <Badge
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" /> {e.location}
                  </Badge>
                </CardDescription>
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

export default ShowEventsList;
