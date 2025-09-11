// app/(routes)/adminevents/new/page.tsx
"use client";

import UpdateEvents from "../_components/UpdateEvents";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <UpdateEvents
        // Yeni etkinlik olduğu için event vermeye gerek yok
        onSaved={(savedEvent) => {
          console.log("Yeni etkinlik kaydedildi:", savedEvent);
          // Kaydedildikten sonra admin etkinlikler sayfasına yönlendir
          router.push("/adminevents");
        }}
        onCancel={() => {
          // İptal edildiğinde de admin etkinlikler sayfasına dön
          router.push("/adminevents");
        }}
      />
    </div>
  );
}
