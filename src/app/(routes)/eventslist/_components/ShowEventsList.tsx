"use client";

import { useState, memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Image as ImageIcon,
  Search,
  XCircle,
  Users,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Event, EventDay } from "@/types/event";

// ✅ Props tipi
type ShowEventsListProps = {
  events: Event[];
};

type ErrorModalProps = {
  message: string;
  onClose: () => void;
};

// ✅ Error Modal Component - displayName eklendi
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

ErrorModal.displayName = "ErrorModal";

// ✅ Event Day formatı - hata kontrolü eklendi
function formatEventDay(day: EventDay) {
  try {
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    const date = new Date(day.date);

    // ✅ Geçersiz tarih kontrolü
    if (isNaN(date.getTime())) {
      console.warn("Geçersiz tarih:", day.date);
      return {
        date: "Geçersiz tarih",
        time: day.startTime || "Saat belirtilmemiş",
      };
    }

    const formattedDate = date.toLocaleDateString("tr-TR", dateOptions);
    const formattedStartTime = day.startTime || "00:00";
    const formattedEndTime = day.endTime ? ` - ${day.endTime}` : "";

    return {
      date: formattedDate,
      time: formattedStartTime + formattedEndTime,
    };
  } catch (error) {
    console.error("Tarih formatlanırken hata:", error);
    return {
      date: "Hatalı tarih",
      time: "Hatalı saat",
    };
  }
}

// ✅ Loading Component
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
));

LoadingSpinner.displayName = "LoadingSpinner";

// ✅ Empty State Component
const EmptyState = memo(({ onGoBack }: { onGoBack: () => void }) => (
  <div className="flex flex-col min-h-screen items-center justify-center space-y-6 p-4 text-center bg-background">
    <div className="text-8xl mb-4">🎭</div>
    <h2 className="text-3xl font-bold text-muted-foreground">
      Henüz hiç etkinlik bulunmuyor
    </h2>
    <p className="text-lg text-muted-foreground max-w-md">
      Yakında yeni etkinlikler eklenecektir. Takipte kalın!
    </p>
    <Button onClick={onGoBack} variant="outline" className="mt-4 group">
      <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
      Ana Sayfaya Dön
    </Button>
  </div>
));

EmptyState.displayName = "EmptyState";

// ✅ Ana Component
const ShowEventsList = ({ events }: ShowEventsListProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "upcoming" | "happened"
  >("all");
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // ✅ Image error handler
  const handleImageError = (eventId: string) => {
    setImageErrors((prev) => new Set([...prev, eventId]));
  };

  // ✅ Memoized filtered events - performance için
  const filteredEvents = useMemo(() => {
    if (!events || !Array.isArray(events)) {
      return [];
    }

    return events.filter((event) => {
      try {
        // ✅ Null/undefined kontrolü
        const title = event.title || "";
        const description = event.description || "";
        const location = event.location || "";

        // ✅ Arama filtresi - case insensitive
        const searchTerm = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !searchTerm ||
          title.toLowerCase().includes(searchTerm) ||
          description.toLowerCase().includes(searchTerm) ||
          location.toLowerCase().includes(searchTerm);

        // ✅ Durum filtresi
        const matchesFilter =
          filterStatus === "all" ||
          (filterStatus === "upcoming" && !event.didItHappen) ||
          (filterStatus === "happened" && event.didItHappen);

        return matchesSearch && matchesFilter;
      } catch (error) {
        console.error("Event filtrelenirken hata:", error, event);
        return false;
      }
    });
  }, [events, searchQuery, filterStatus]);

  // ✅ Statistics - memoized
  const stats = useMemo(() => {
    if (!events || !Array.isArray(events)) {
      return { total: 0, upcoming: 0, happened: 0 };
    }

    return {
      total: events.length,
      upcoming: events.filter((e) => !e.didItHappen).length,
      happened: events.filter((e) => e.didItHappen).length,
    };
  }, [events]);

  // ✅ Loading durumu
  if (!events) {
    return <LoadingSpinner />;
  }

  // ✅ Boş veri kontrolü
  if (!Array.isArray(events) || events.length === 0) {
    return <EmptyState onGoBack={() => router.push("/")} />;
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-background text-foreground">
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}

      {/* ✅ Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-center sm:text-left">
            Etkinlikler 🎉
          </h1>
          <p className="text-muted-foreground mt-2">
            Toplam {stats.total} etkinlik bulunuyor
          </p>
        </div>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="group transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Geri Dön
        </Button>
      </div>
      <Separator className="mb-8" />

      {/* ✅ Arama ve Filtre */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
        {/* Arama */}
        <div className="relative w-full lg:w-1/2 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Etkinlik başlığı, açıklaması veya lokasyonu ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <Button
              onClick={() => setSearchQuery("")}
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filtre Badge'leri */}
        <div className="flex flex-wrap justify-center lg:justify-end gap-2">
          <Badge
            onClick={() => setFilterStatus("all")}
            variant={filterStatus === "all" ? "default" : "secondary"}
            className={`cursor-pointer px-4 py-2 transition-all duration-200 hover:scale-105 ${
              filterStatus === "all"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            Tümü ({stats.total})
          </Badge>
          <Badge
            onClick={() => setFilterStatus("upcoming")}
            variant={filterStatus === "upcoming" ? "default" : "secondary"}
            className={`cursor-pointer px-4 py-2 transition-all duration-200 hover:scale-105 ${
              filterStatus === "upcoming"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
            }`}
          >
            <Clock className="h-3 w-3 mr-1" />
            Yaklaşanlar ({stats.upcoming})
          </Badge>
          <Badge
            onClick={() => setFilterStatus("happened")}
            variant={filterStatus === "happened" ? "default" : "secondary"}
            className={`cursor-pointer px-4 py-2 transition-all duration-200 hover:scale-105 ${
              filterStatus === "happened"
                ? "bg-green-600 text-white shadow-md"
                : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
            }`}
          >
            ✓ Gerçekleşenler ({stats.happened})
          </Badge>
        </div>
      </div>

      {/* ✅ Results Info */}
      {(searchQuery || filterStatus !== "all") && (
        <div className="text-center mb-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">{filteredEvents.length}</span>{" "}
            etkinlik
            {searchQuery && (
              <span>
                {" "}
                "<span className="font-medium">{searchQuery}</span>" için
              </span>
            )}
            {filterStatus !== "all" && (
              <span>
                {" "}
                {filterStatus === "upcoming" ? "yaklaşan" : "gerçekleşen"}{" "}
                kategorisinde
              </span>
            )}{" "}
            bulundu
          </p>
          {(searchQuery || filterStatus !== "all") && (
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>
      )}

      {/* ✅ Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="flex flex-col h-full border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
            >
              <CardHeader className="p-4 pb-2">
                {/* ✅ Event Image */}
                <div className="relative w-full h-40 rounded-lg mb-4 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {event.image && !imageErrors.has(event.id) ? (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={() => handleImageError(event.id)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Status Badge Overlay */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={event.didItHappen ? "default" : "secondary"}
                      className={`text-xs ${
                        event.didItHappen
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {event.didItHappen ? "✓ Tamamlandı" : "⏳ Yaklaşan"}
                    </Badge>
                  </div>
                </div>

                {/* ✅ Event Title */}
                <CardTitle className="line-clamp-2 text-xl font-bold group-hover:text-primary transition-colors duration-200">
                  {event.title}
                </CardTitle>

                {/* ✅ Location */}
                <CardDescription className="flex justify-center mt-2">
                  <Badge
                    variant="outline"
                    className="text-xs flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </Badge>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2 flex-grow flex flex-col">
                {/* ✅ Event Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-grow">
                  {event.description}
                </p>

                {/* ✅ Event Days */}
                {event.eventDays?.length > 0 && (
                  <div className="mt-auto">
                    <h4 className="font-semibold text-base flex items-center gap-1 mb-3">
                      <CalendarDays className="h-4 w-4" />
                      Tarihler ({event.eventDays.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {event.eventDays.slice(0, 3).map((day, index) => {
                        const { date, time } = formatEventDay(day);
                        return (
                          <div
                            key={day.id || index}
                            className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm"
                          >
                            <span className="font-medium text-xs">{date}</span>
                            <Badge variant="outline" className="text-xs">
                              {time}
                            </Badge>
                          </div>
                        );
                      })}
                      {event.eventDays.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center py-1">
                          +{event.eventDays.length - 3} gün daha...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ✅ Additional Info */}
                {(event.estimatedAttendees || event.numberOfAttendees) && (
                  <div className="flex flex-col gap-1 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {event.estimatedAttendees && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>Tahmini: {event.estimatedAttendees} kişi</span>
                      </div>
                    )}
                    {event.numberOfAttendees && (
                      <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <Users className="h-3 w-3" />
                        <span>Katılan: {event.numberOfAttendees} kişi</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-muted-foreground mb-2">
              Aradığınız kriterlere uygun etkinlik bulunamadı
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Farklı arama terimleri deneyin veya filtreleri değiştirin
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
              }}
              variant="outline"
              className="mx-auto"
            >
              Tüm Etkinlikleri Göster
            </Button>
          </div>
        )}
      </div>

      {/* ✅ Footer Info */}
      {filteredEvents.length > 0 && (
        <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-muted-foreground">
            Toplam {stats.total} etkinlik bulunuyor, {filteredEvents.length}{" "}
            tanesi gösteriliyor
          </p>
        </div>
      )}
    </div>
  );
};

export default ShowEventsList;
