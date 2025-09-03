"use client";

import { useState, memo } from "react";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Event, EventDay } from "@/types/event"; // ✅ Doğru import

// Props tipi
type ShowEventsListProps = {
  events: Event[];
};

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

const ShowEventsList = ({ events }: ShowEventsListProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "upcoming" | "happened"
  >("all");

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
          onClick={() => router.push("/")}
          variant="outline"
          className="group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Geri Dön
        </Button>
      </div>
      <Separator className="mb-6" />

      {/* Arama ve Filtre */}
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
            onClick={() => setFilterStatus("all")}
            className={`cursor-pointer px-3 py-1 ${
              filterStatus === "all" ? "bg-primary text-white" : "bg-secondary"
            }`}
          >
            Tümü
          </Badge>
          <Badge
            onClick={() => setFilterStatus("upcoming")}
            className={`cursor-pointer px-3 py-1 ${
              filterStatus === "upcoming"
                ? "bg-blue-600 text-white"
                : "bg-blue-100"
            }`}
          >
            Yaklaşanlar
          </Badge>
          <Badge
            onClick={() => setFilterStatus("happened")}
            className={`cursor-pointer px-3 py-1 ${
              filterStatus === "happened"
                ? "bg-green-600 text-white"
                : "bg-green-100"
            }`}
          >
            Gerçekleşenler
          </Badge>
        </div>
      </div>

      {/* Liste */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((e) => (
            <Card key={e.id} className="flex flex-col h-full border-2">
              <CardHeader className="p-4 pb-2">
                <div className="relative w-full h-40 rounded-md mb-4 bg-gray-100">
                  {e.image ? (
                    <Image
                      src={e.image}
                      alt={e.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-20 h-20 text-gray-400" />
                  )}
                </div>
                <CardTitle className="line-clamp-2 text-xl font-bold">
                  {e.title}
                </CardTitle>
                <CardDescription className="flex flex-col items-center space-y-1 mt-1">
                  <Badge
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    {e.location}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-grow">
                <p className="text-sm text-gray-600">{e.description}</p>
                {e.eventDays?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-lg flex items-center gap-1">
                      <CalendarDays className="h-5 w-5" /> Tarihler
                    </h4>
                    {e.eventDays.map((day, i) => {
                      const { date, time } = formatEventDay(day);
                      return (
                        <div key={i} className="mt-2 flex justify-between">
                          <span>{date}</span>
                          <Badge>{time}</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-xl text-muted-foreground">
            😔 Aradığınız kriterlere uygun etkinlik bulunamadı.
          </p>
        )}
      </div>
    </div>
  );
};

export default ShowEventsList;
