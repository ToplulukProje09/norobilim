"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import Image from "next/image";
import {
  ChevronDown,
  Trash2,
  Edit,
  PlusCircle,
  ArrowLeft,
  SearchIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Comment {
  text: string;
  createdAt: string;
}

interface Blog {
  id: string;
  title: string;
  description: string;
  paragraph?: string;
  shortText?: string;
  mainPhoto: string;
  images: string[];
  comments: Comment[];
  show: boolean;
  commentsAllowed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const router = useRouter();

  // Arama ve Filtreleme için yeni state'ler
  const [searchQuery, setSearchQuery] = useState("");
  const [publicationFilter, setPublicationFilter] = useState<
    "all" | "published" | "unpublished"
  >("all");
  const [commentsFilter, setCommentsFilter] = useState<
    "all" | "open" | "closed"
  >("all");
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      const sorted = Array.isArray(data)
        ? data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        : [];
      setBlogs(sorted);
    } catch (err) {
      console.error(err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filtreleme ve arama mantığı
  useEffect(() => {
    let newFilteredBlogs = blogs.filter((blog) => {
      // 1. Arama filtresi: Başlık veya açıklamaya göre ara
      const matchesSearch =
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.description.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Yayın Durumu filtresi
      const matchesPublication =
        publicationFilter === "all" ||
        (publicationFilter === "published" && blog.show) ||
        (publicationFilter === "unpublished" && !blog.show);

      // 3. Yorum İzni filtresi
      const matchesComments =
        commentsFilter === "all" ||
        (commentsFilter === "open" && blog.commentsAllowed) ||
        (commentsFilter === "closed" && !blog.commentsAllowed);

      return matchesSearch && matchesPublication && matchesComments;
    });

    setFilteredBlogs(newFilteredBlogs);
  }, [blogs, searchQuery, publicationFilter, commentsFilter]);

  const deleteBlog = async (id: string) => {
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silme işlemi başarısız");
      setBlogs(blogs.filter((blog) => blog.id !== id));
      setOpenDialogId(null);
    } catch (err) {
      console.error(err);
      alert("Silme sırasında hata oluştu");
    }
  };

  const toggleShow = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ show: !current }),
      });
      if (!res.ok) throw new Error("Görünürlük değiştirme başarısız");

      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.id === id ? { ...blog, show: !current } : blog
        )
      );
    } catch (err) {
      console.error(err);
      alert("Görünürlük değiştirme sırasında hata oluştu");
    }
  };

  const toggleComments = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentsAllowed: !current }),
      });
      if (!res.ok) throw new Error("Yorum izni değiştirme başarısız");

      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.id === id ? { ...blog, commentsAllowed: !current } : blog
        )
      );
    } catch (err) {
      console.error(err);
      alert("Yorum izni değiştirme sırasında hata oluştu");
    }
  };

  const deleteComment = async (blogId: string, commentIndex: number) => {
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments/${commentIndex}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error);

      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blogId ? { ...b, comments: data.comments } : b
        )
      );
    } catch (err: any) {
      console.error("Delete comment error:", err);
      alert("Yorum silinirken hata oluştu: " + err.message);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-xl text-muted-foreground animate-pulse">
          Bloglar yükleniyor...
        </p>
      </div>
    );

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight text-center sm:text-left">
          Blog Yönetimi ✍️
        </h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/admin")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Geri
          </Button>
          <Button onClick={() => router.push("/adminblogs/new")}>
            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Blog Ekle
          </Button>
        </div>
      </div>

      {/* Arama ve Filtreleme Alanı */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Blog ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>
        <Select
          value={publicationFilter}
          onValueChange={(value: "all" | "published" | "unpublished") =>
            setPublicationFilter(value)
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Yayın Durumu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hepsi</SelectItem>
            <SelectItem value="published">Yayında</SelectItem>
            <SelectItem value="unpublished">Yayında Değil</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={commentsFilter}
          onValueChange={(value: "all" | "open" | "closed") =>
            setCommentsFilter(value)
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Yorumlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hepsi</SelectItem>
            <SelectItem value="open">Yorumlara Açık</SelectItem>
            <SelectItem value="closed">Yorumlara Kapalı</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Blog listesi veya boş durum mesajı */}
      {filteredBlogs.length === 0 && blogs.length > 0 ? (
        <div className="flex flex-col min-h-[50vh] items-center justify-center space-y-4 p-4 text-center">
          <p className="text-xl text-muted-foreground">
            Filtreleme sonucunda blog bulunamadı. 😔
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setPublicationFilter("all");
              setCommentsFilter("all");
            }}
            variant="outline"
          >
            Filtreleri Temizle
          </Button>
        </div>
      ) : filteredBlogs.length === 0 && blogs.length === 0 ? (
        <div className="flex flex-col min-h-[50vh] items-center justify-center space-y-4 p-4 text-center">
          <p className="text-xl text-muted-foreground">Henüz blog yok. 😔</p>
          <Button onClick={() => router.push("/adminblogs/new")}>
            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Blog Ekle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {filteredBlogs.map((b) => (
            <Card
              key={b.id}
              className={`flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl dark:bg-zinc-900 border-2 dark:border-zinc-800 ${
                b.show ? "border-green-500/50" : "border-red-500/50"
              }`}
            >
              {b.mainPhoto && (
                <div className="relative w-full h-48 sm:h-56">
                  <Image
                    src={b.mainPhoto}
                    alt={b.title}
                    fill
                    className="object-cover rounded-t-md"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <Badge
                    className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 ${
                      b.show
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {b.show ? "Yayında" : "Yayında Değil"}
                  </Badge>
                  <Badge
                    className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 ${
                      b.commentsAllowed
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {b.commentsAllowed ? "Yorumlara Açık" : "Yorumlara Kapalı"}
                  </Badge>
                </div>
              )}
              <CardHeader className="flex-grow pb-0">
                <CardTitle className="line-clamp-2 text-lg">
                  {b.title}
                </CardTitle>
                <CardDescription className="line-clamp-3 text-sm">
                  {b.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 pb-0 flex-grow">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">
                      Oluşturulma:
                    </span>{" "}
                    {formatDateTime(b.createdAt)}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">
                      Son Güncelleme:
                    </span>{" "}
                    {formatDateTime(b.updatedAt)}
                  </p>
                </div>

                <Dialog
                  open={openDialogId === b.id}
                  onOpenChange={(open) => setOpenDialogId(open ? b.id : null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between mt-4 text-sm"
                    >
                      <span>Detayları Gör</span>
                      <ChevronDown className="h-4 w-4 transition-transform group-[data-state=open]:rotate-180" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="sm:max-w-[800px] flex flex-col h-[90vh] md:h-auto md:max-h-[90vh] p-0"
                    onInteractOutside={(e) => {
                      if (openDialogId !== b.id) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <DialogHeader className="p-6 pb-2">
                      <DialogTitle>{b.title}</DialogTitle>
                      <DialogDescription>{b.description}</DialogDescription>
                    </DialogHeader>

                    <div className="flex-grow overflow-y-auto px-6 py-4">
                      <div className="space-y-6">
                        {b.shortText && (
                          <div className="border-t pt-4">
                            <p className="font-semibold text-sm">Özet Metin:</p>
                            <p className="mt-1 text-sm text-muted-foreground text-wrap break-words">
                              {b.shortText}
                            </p>
                          </div>
                        )}
                        {b.paragraph && (
                          <div className="border-t pt-4">
                            <p className="font-semibold text-sm">
                              İçerik Metni:
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground text-wrap break-words">
                              {b.paragraph}
                            </p>
                          </div>
                        )}
                        {b.images.length > 0 && (
                          <div className="border-t pt-4">
                            <p className="font-semibold text-sm">
                              Ek Fotoğraflar:
                            </p>
                            <div className="flex gap-2 flex-wrap mt-2">
                              <TooltipProvider>
                                {b.images.map((img, i) => (
                                  <Tooltip key={i}>
                                    <TooltipTrigger asChild>
                                      <Image
                                        src={img}
                                        alt={`Ek Foto ${i + 1}`}
                                        width={100}
                                        height={100}
                                        className="w-16 h-16 object-cover rounded-md cursor-pointer transition-transform hover:scale-105"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <Image
                                        src={img}
                                        alt={`Ek Foto ${i + 1}`}
                                        width={200}
                                        height={200}
                                        className="rounded-md"
                                      />
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </TooltipProvider>
                            </div>
                          </div>
                        )}
                        {b.comments.length > 0 && (
                          <div className="border-t pt-4">
                            <p className="font-semibold text-sm">Yorumlar:</p>
                            <ul className="list-inside pl-0 mt-2 space-y-3">
                              {b.comments.map((c, i) => (
                                <li
                                  key={i}
                                  className="flex items-start justify-between p-3 rounded-md bg-zinc-100 dark:bg-zinc-800 transition-shadow hover:shadow-md group"
                                >
                                  <span className="flex-grow pr-2 text-sm break-all">
                                    {c.text}
                                    <span className="block text-xs text-muted-foreground mt-1">
                                      {formatDateTime(c.createdAt)}
                                    </span>
                                  </span>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Bu yorumu silmek istediğine emin
                                          misin?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Bu işlem geri alınamaz. Yorum kalıcı
                                          olarak silinecektir.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          İptal
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteComment(b.id, i)}
                                        >
                                          Sil
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t">
                      <div className="flex items-center gap-2 mb-4 sm:mb-0">
                        <input
                          type="checkbox"
                          id={`dialog-show-toggle-${b.id}`}
                          checked={b.show}
                          onChange={() => toggleShow(b.id, b.show)}
                          className="
                            h-6 w-6 rounded border-2 appearance-none cursor-pointer
                            border-gray-300 bg-gray-100
                            hover:border-blue-500 hover:bg-blue-100 
                            checked:bg-blue-600 checked:border-blue-600 checked:ring-2 checked:ring-blue-600 checked:ring-offset-2
                            dark:border-gray-700 dark:bg-gray-900 
                            dark:hover:border-blue-500 dark:hover:bg-blue-900
                            dark:checked:bg-blue-600 dark:checked:border-blue-600 dark:checked:ring-2 dark:checked:ring-blue-600 dark:checked:ring-offset-2 dark:checked:ring-offset-gray-900
                            transition-all ease-in-out
                          "
                        />
                        <label
                          htmlFor={`dialog-show-toggle-${b.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {b.show ? "Yayında" : "Yayında Değil"}
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`dialog-comments-toggle-${b.id}`}
                          checked={b.commentsAllowed || false}
                          onChange={() =>
                            toggleComments(b.id, b.commentsAllowed || false)
                          }
                          className="
                            h-6 w-6 rounded border-2 appearance-none cursor-pointer
                            border-gray-300 bg-gray-100
                            hover:border-blue-500 hover:bg-blue-100
                            checked:bg-blue-600 checked:border-blue-600 checked:ring-2 checked:ring-blue-600 checked:ring-offset-2
                            dark:border-gray-700 dark:bg-gray-900
                            dark:hover:border-blue-500 dark:hover:bg-blue-900
                            dark:checked:bg-blue-600 dark:checked:border-blue-600 dark:checked:ring-2 dark:checked:ring-blue-600 dark:checked:ring-offset-2 dark:checked:ring-offset-gray-900
                            transition-all ease-in-out
                          "
                        />
                        <label
                          htmlFor={`comments-toggle-${b.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {b.commentsAllowed
                            ? "Yorumlara Açık"
                            : "Yorumlara Kapalı"}
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            router.push(`/adminblogs/${b.id}`);
                            setOpenDialogId(null);
                          }}
                          variant="secondary"
                        >
                          <Edit className="h-4 w-4 mr-2" /> Güncelle
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> Sil
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Silmek istediğine emin misin?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu işlem geri alınamaz. Blog kalıcı olarak
                                silinecektir.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteBlog(b.id)}
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-4">
                <Separator className="mb-2" />
                <div className="flex items-center w-full justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`show-toggle-${b.id}`}
                      checked={b.show}
                      onChange={() => toggleShow(b.id, b.show)}
                      className="
                        h-6 w-6 rounded border-2 appearance-none cursor-pointer
                        border-gray-300 bg-gray-100
                        hover:border-blue-500 hover:bg-blue-100 
                        checked:bg-blue-600 checked:border-blue-600 checked:ring-2 checked:ring-blue-600 checked:ring-offset-2
                        dark:border-gray-700 dark:bg-gray-900 
                        dark:hover:border-blue-500 dark:hover:bg-blue-900
                        dark:checked:bg-blue-600 dark:checked:border-blue-600 dark:checked:ring-2 dark:checked:ring-blue-600 dark:checked:ring-offset-2 dark:checked:ring-offset-gray-900
                        transition-all ease-in-out
                      "
                    />
                    <label
                      htmlFor={`show-toggle-${b.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {b.show ? "Yayında" : "Yayında Değil"}
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`comments-toggle-${b.id}`}
                      checked={b.commentsAllowed || false}
                      onChange={() =>
                        toggleComments(b.id, b.commentsAllowed || false)
                      }
                      className="
                        h-6 w-6 rounded border-2 appearance-none cursor-pointer
                        border-gray-300 bg-gray-100
                        hover:border-blue-500 hover:bg-blue-100
                        checked:bg-blue-600 checked:border-blue-600 checked:ring-2 checked:ring-blue-600 checked:ring-offset-2
                        dark:border-gray-700 dark:bg-gray-900
                        dark:hover:border-blue-500 dark:hover:bg-blue-900
                        dark:checked:bg-blue-600 dark:checked:border-blue-600 dark:checked:ring-2 dark:checked:ring-blue-600 dark:checked:ring-offset-2 dark:checked:ring-offset-gray-900
                        transition-all ease-in-out
                      "
                    />
                    <label
                      htmlFor={`comments-toggle-${b.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {b.commentsAllowed
                        ? "Yorumlara Açık"
                        : "Yorumlara Kapalı"}
                    </label>
                  </div>
                  <div className="flex gap-2 flex-grow-0">
                    <Button
                      onClick={() => router.push(`/adminblogs/${b.id}`)}
                      variant="secondary"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Güncelle
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Sil
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Silmek istediğine emin misin?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu işlem geri alınamaz. Blog kalıcı olarak
                            silinecektir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteBlog(b.id)}>
                            Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
