"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // useRouter import'u eklendi
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Save, X, Plus, ArrowLeft } from "lucide-react"; // ArrowLeft icon'u eklendi

interface Notification {
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export default function YasaklarPage() {
  const [words, setWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editWord, setEditWord] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState("");
  const [notification, setNotification] = useState<Notification | null>(null);
  const router = useRouter(); // Hata veren kısım düzeltildi ve aktif hale getirildi

  // Bildirim gösterme ve gizleme fonksiyonu
  const showNotification = (message: string, type: Notification["type"]) => {
    setNotification({ message, type });
    // 3 saniye sonra bildirimi gizle
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const fetchWords = async () => {
    try {
      const res = await fetch("/api/yasak");
      const data = await res.json();
      setWords(data.words || []);
    } catch (err) {
      console.error(err);
      showNotification(
        "Yasaklı kelimeler getirilirken bir hata oluştu.",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const handleAdd = async () => {
    if (!newWord.trim()) {
      showNotification("Kelime boş olamaz.", "warning");
      return;
    }
    try {
      const res = await fetch("/api/yasak/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: newWord.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setWords(data.words);
        showNotification(
          `"${newWord.trim()}" kelimesi başarıyla eklendi.`,
          "success"
        );
      } else {
        showNotification(
          data.error || "Kelime eklenirken bir hata oluştu.",
          "error"
        );
      }
      setNewWord("");
    } catch (err: any) {
      console.error(err);
      showNotification("Kelime eklenirken bir hata oluştu.", "error");
    }
  };

  const handleDelete = async (word: string) => {
    try {
      const res = await fetch("/api/yasak/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      const data = await res.json();
      if (res.ok) {
        setWords(data.words);
        showNotification(`"${word}" kelimesi başarıyla silindi.`, "info");
      } else {
        showNotification(
          data.error || "Kelime silinirken bir hata oluştu.",
          "error"
        );
      }
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      showNotification("Kelime silinirken bir hata oluştu.", "error");
    }
  };

  const handleEdit = async (index: number) => {
    const oldWord = words[index];
    if (!editWord.trim()) {
      showNotification("Yeni kelime boş olamaz.", "warning");
      return;
    }
    try {
      const res = await fetch("/api/yasak/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldWord: words[index],
          newWord: editWord.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWords(data.words);
        setEditIndex(null);
        setEditWord("");
        // Kelime değiştirildiğinde özel bildirim
        showNotification(
          `"${oldWord}" kelimesi "${editWord.trim()}" olarak değiştirildi.`,
          "success"
        );
      } else {
        showNotification(
          data.error || "Kelime güncellenirken bir hata oluştu.",
          "error"
        );
      }
    } catch (err: any) {
      console.error(err);
      showNotification("Kelime güncellenirken bir hata oluştu.", "error");
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index?: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index !== undefined) {
        handleEdit(index);
      } else {
        handleAdd();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4 transition-colors duration-300 relative">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Yasak Kelimeler Yönetimi</CardTitle>
          {/* Geri butonu eklendi */}
          <Button onClick={() => router.push("/admin")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Geri
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Label htmlFor="new-word">Yeni kelime ekle</Label>
              <Input
                id="new-word"
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Örnek: kötükelime"
              />
            </div>
            <Button onClick={handleAdd} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Ekle
            </Button>
          </div>

          <ul className="space-y-3">
            {words.map((w, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-3 rounded-md bg-secondary text-secondary-foreground shadow-sm"
              >
                {editIndex === i ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      type="text"
                      value={editWord}
                      onChange={(e) => setEditWord(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(i)}
                    >
                      <Save className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditIndex(null)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-lg">{w}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditIndex(i);
                          setEditWord(w);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setWordToDelete(w);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Bu, "{wordToDelete}" kelimesini kalıcı
              olarak siler.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(wordToDelete)}>
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Özel Bildirim Bileşeni */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-xl text-white transition-opacity duration-300 z-50
            ${notification.type === "success" ? "bg-green-500" : ""}
            ${notification.type === "error" ? "bg-red-500" : ""}
            ${notification.type === "warning" ? "bg-yellow-500" : ""}
            ${notification.type === "info" ? "bg-blue-500" : ""}
          `}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}
