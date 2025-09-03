// src/components/NotFoundPage.jsx

import { Button } from "@/components/ui/button";
import React from "react";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="text-9xl font-extrabold tracking-widest text-primary">
          404
        </h1>
        <div className="mt-4 animate-pulse rounded-md bg-secondary px-2 text-sm text-secondary-foreground">
          Sayfa Bulunamadı
        </div>
        <p className="mt-6 text-xl">Aradığınız sayfa mevcut değil.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Belki de adres yanlış yazılmıştır ya da sayfa taşınmıştır.
        </p>
        <a href="/">
          <Button className="mt-8 rounded-full">Ana Sayfaya Dön</Button>
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
