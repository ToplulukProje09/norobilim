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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Image as ImageIcon,
  Info,
  Search,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Event, EventDay } from "@/types/event";

type ErrorModalProps = {
  message: string;
  onClose: () => void;
};

// ErrorModal bileşeni yeniden kullanılabilir olması için dışarı taşındı
const ErrorModal = memo<ErrorModalProps>(({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-sm text-center transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center mb-4">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-red-600 mb-2">Hata!</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>
        <Button onClick={onClose} variant="outline" className="w-full">
          Tamam
        </Button>
      </div>
    </div>
  );
});

// LoadingSpinner bileşeni yeniden kullanılabilir olması için dışarı taşındı
const LoadingSpinner = memo(() => (
  <div className="flex min-h-screen items-center justify-center p-4 bg-background">
    <div className="flex flex-col items-center space-y-4">
      <svg
        className="animate-spin h-10 w-10 text-primary"
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
      <p className="text-xl text-muted-foreground font-semibold">
        Etkinlikler yükleniyor...
      </p>
    </div>
  </div>
));

function formatEventDay(day: EventDay) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const date = new Date(day.date);
  const formattedDate = date.toLocaleDateString("tr-TR", dateOptions);
  const formattedStartTime = day.startTime;
  const formattedEndTime = day.endTime ? ` - ${day.endTime}` : "";
  const timeString = formattedStartTime + formattedEndTime;

  return {
    date: formattedDate,
    time: timeString,
  };
}

const ShowEventsList = ({ events: initialEvents }: { events: Event[] }) => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "upcoming" | "happened"
  >("all");

  useEffect(() => {
    // Sunucudan gelen başlangıç verilerini kullan
    setEvents(initialEvents);
  }, [initialEvents]);

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

  if (loading) {
    return <LoadingSpinner />;
  }

  // Etkinlik yoksa bilgilendirme ekranı
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center space-y-6 p-4 text-center bg-background">
        <h2 className="text-2xl font-bold text-muted-foreground">
          😔 Henüz hiç etkinlik bulunmuyor.
        </h2>
        <p className="text-lg text-muted-foreground">
          Yakında yeni etkinlikler eklenecektir. Takipte kalın!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-background text-foreground">
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 space-y-4 sm:space-y-0">
        <h1 className="text-4xl font-extrabold tracking-tight text-center sm:text-left">
          Etkinlikler 🎉
        </h1>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />{" "}
          Geri Dön
        </Button>
      </div>
      <Separator className="mb-6" />

      {/* Arama ve Filtre Bölümü - max-w-4xl mx-auto ile ortalandı */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 max-w-4xl mx-auto">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Etkinlik ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-5 py-3 text-base"
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
      {/* End of Arama ve Filtre Bölümü */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((e) => (
            <Card
              key={e.id}
              className="flex flex-col h-full overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-gray-800 border-2"
            >
              <CardHeader className="flex flex-col items-center p-4 pb-2">
                <div className="relative w-full h-40 object-cover rounded-md mb-4 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  {e.image ? (
                    <Image
                      src={e.image}
                      alt={e.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-110"
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
                    {e.didItHappen !== undefined && (
                      <Badge
                        className={`text-xs font-medium px-3 py-1 ${
                          e.didItHappen
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {e.didItHappen ? "Gerçekleşti" : "Yakında"}
                      </Badge>
                    )}
                    {e.didItHappen &&
                      (e.numberOfAttendees !== undefined ||
                        e.numberOfAttendees !== null) &&
                      e.numberOfAttendees !== null && (
                        <Badge className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {e.numberOfAttendees} Katılımcı
                        </Badge>
                      )}
                    {!e.didItHappen &&
                      (e.estimatedAttendees !== undefined ||
                        e.estimatedAttendees !== null) &&
                      e.estimatedAttendees !== null && (
                        <Badge className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Tahmini {e.estimatedAttendees} Katılımcı
                        </Badge>
                      )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-grow">
                <div className="flex flex-col gap-3">
                  <div className="mb-2">
                    <h4 className="font-semibold text-lg text-primary flex items-center gap-1">
                      <Info className="h-5 w-5" /> Açıklama
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {e.description}
                    </p>
                  </div>
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
                              key={day.id ?? index}
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
                                        <li key={detailIndex}>
                                          {detail.trim()}
                                        </li>
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
                  {e.eventImages && e.eventImages.length > 0 && (
                    <div className="border-t border-dashed pt-3 border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-lg text-primary mb-2 flex items-center gap-1">
                        <ImageIcon className="h-5 w-5" /> Ek Fotoğraflar
                      </h4>
                      <div className="flex flex-wrap gap-2 py-2">
                        {e.eventImages.map((img, index) => (
                          <div
                            key={index}
                            className="relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 border-gray-300 dark:border-gray-700"
                          >
                            <Image
                              src={img}
                              alt={`Ek fotoğraf ${index + 1}`}
                              fill
                              sizes="20vw"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center md:col-span-full py-12 flex flex-col items-center justify-center space-y-4">
            <h3 className="text-2xl font-bold text-muted-foreground">
              😔 Üzgünüz,
            </h3>
            <p className="text-xl text-muted-foreground">
              Aradığınız kriterlere uygun bir etkinlik bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowEventsList;
