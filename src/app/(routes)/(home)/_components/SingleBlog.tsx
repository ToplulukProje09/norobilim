"use client";

import { useEffect, useState, KeyboardEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlignJustify,
  Newspaper,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Timer,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  CalendarDays,
  History,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

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
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  commentsAllowed?: boolean;
}

interface MainMenuData {
  titlePrimary: string;
  mainPhoto: string;
  mainParagraph: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SingleBlogPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [addingComment, setAddingComment] = useState<{
    [key: string]: boolean;
  }>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    undefined
  );
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const commentsScrollAreaRef = useRef<HTMLDivElement | null>(null);
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>(
    {}
  );
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const blogRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [mainMenu, setMainMenu] = useState<MainMenuData | null>(null); // ✅ MainMenuData türü güncellendi

  const [alert, setAlert] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({ open: false, title: "", description: "" });

  const showAlert = (title: string, description: string) => {
    setAlert({ open: true, title, description });
  };

  const calculateReadingTime = (text: string | undefined): number => {
    if (!text) return 0;
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    setCanScrollLeft(carousel.scrollLeft > 0);
    setCanScrollRight(
      Math.ceil(carousel.scrollLeft + carousel.clientWidth) <
        carousel.scrollWidth
    );
  };

  const scrollBy = (amount: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleBack = () => {
    router.push("/");
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || !selectedBlog?.images.length) return;

    let scrollInterval: NodeJS.Timeout;
    let isPaused = false;

    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        if (!isPaused) {
          const currentScroll = carousel.scrollLeft;
          const maxScroll = carousel.scrollWidth - carousel.clientWidth;

          if (currentScroll + carousel.clientWidth >= carousel.scrollWidth) {
            carousel.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            const scrollAmount =
              carousel.clientWidth /
              (selectedBlog.images.length > 1 ? selectedBlog.images.length : 1);
            carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
          }
        }
      }, 3000);
    };

    const stopScrolling = () => {
      clearInterval(scrollInterval);
    };

    const handleMouseEnter = () => {
      isPaused = true;
      stopScrolling();
    };

    const handleMouseLeave = () => {
      isPaused = false;
      startScrolling();
    };

    carousel.addEventListener("mouseenter", handleMouseEnter);
    carousel.addEventListener("mouseleave", handleMouseLeave);

    startScrolling();

    return () => {
      stopScrolling();
      carousel.removeEventListener("mouseenter", handleMouseEnter);
      carousel.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [selectedBlog, carouselRef]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      const observer = new ResizeObserver(handleScroll);
      observer.observe(carousel);
      carousel.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => {
        observer.disconnect();
        carousel.removeEventListener("scroll", handleScroll);
      };
    }
  }, [selectedBlog]);

  useEffect(() => {
    if (commentsScrollAreaRef.current) {
      const scrollElement = commentsScrollAreaRef.current;
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [selectedBlog?.id, selectedBlog?.comments.length]);

  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      element.style.height = "auto";
      element.style.height = element.scrollHeight + "px";
    }
  };

  useEffect(() => {
    if (selectedBlog && textareaRefs.current[selectedBlog.id]) {
      adjustTextareaHeight(textareaRefs.current[selectedBlog.id]);
    }
  }, [selectedBlog]);

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCommentChange = (blogId: string, value: string) => {
    setNewComments((prev) => ({ ...prev, [blogId]: value }));
    if (textareaRefs.current[blogId]) {
      adjustTextareaHeight(textareaRefs.current[blogId]);
    }
  };

  const handleAddComment = async (blogId: string) => {
    const commentText = newComments[blogId]?.trim();
    if (!commentText || !selectedBlog) return;

    const newComment: Comment = {
      text: commentText,
      createdAt: new Date().toISOString(),
    };

    setBlogs((prev) =>
      prev.map((b) =>
        b.id === blogId ? { ...b, comments: [...b.comments, newComment] } : b
      )
    );

    setSelectedBlog((prev) =>
      prev && prev.id === blogId
        ? { ...prev, comments: [...prev.comments, newComment] }
        : prev
    );

    setAddingComment((prev) => ({ ...prev, [blogId]: true }));
    setNewComments((prev) => ({ ...prev, [blogId]: "" }));
    if (textareaRefs.current[blogId]) {
      textareaRefs.current[blogId].value = "";
      adjustTextareaHeight(textareaRefs.current[blogId]);
    }

    try {
      const res = await fetch(`/api/blogs/${blogId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(
          "Yorum Gönderilirken Hata Oluştu",
          data.error || "Yorumunuz eklenemedi. Lütfen tekrar deneyin."
        );

        setBlogs((prev) =>
          prev.map((b) =>
            b.id === blogId
              ? { ...b, comments: b.comments.filter((c) => c !== newComment) }
              : b
          )
        );

        setSelectedBlog((prev) =>
          prev && prev.id === blogId
            ? {
                ...prev,
                comments: prev.comments.filter((c) => c !== newComment),
              }
            : prev
        );
      }
    } catch (err: any) {
      console.error(err);
      showAlert(
        "Bağlantı Hatası",
        "Yorum gönderilirken bir hata oluştu. İnternet bağlantınızı kontrol edin."
      );

      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blogId
            ? { ...b, comments: b.comments.filter((c) => c !== newComment) }
            : b
        )
      );

      setSelectedBlog((prev) =>
        prev && prev.id === blogId
          ? {
              ...prev,
              comments: prev.comments.filter((c) => c !== newComment),
            }
          : prev
      );
    } finally {
      setAddingComment((prev) => ({ ...prev, [blogId]: false }));
    }
  };

  const handleCommentKey = (
    e: KeyboardEvent<HTMLInputElement>,
    blogId: string
  ) => {
    if (e.key === "Enter") handleAddComment(blogId);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevImage = () =>
    setLightboxIndex((i) =>
      i === 0 ? (selectedBlog?.images.length ?? 0) - 1 : i - 1
    );
  const nextImage = () =>
    setLightboxIndex((i) =>
      i === (selectedBlog?.images.length ?? 0) - 1 ? 0 : i + 1
    );

  const shareBlog = (platform: string) => {
    if (!selectedBlog) return;

    const shareUrl = window.location.href;
    const title = selectedBlog.title;

    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(
          `"${title}" başlıklı blog yazısını okumalısın! #blog #frontend`
        )}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
          shareUrl
        )}&title=${encodeURIComponent(title)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`;
        break;
    }

    if (url) {
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/blogs");
        if (!res.ok) throw new Error("Bloglar alınamadı");
        const data = await res.json();
        const blogsWithReadingTime = (Array.isArray(data) ? data : []).map(
          (blog: any) => ({
            ...blog,
            id: blog._id,
            readingTime: calculateReadingTime(blog.paragraph),
          })
        );
        setBlogs(blogsWithReadingTime);
      } catch (err) {
        console.error("Blog fetch error:", err);
      } finally {
        setLoading(false); // ✅ burayı ekle
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    const fetchMainMenu = async () => {
      try {
        const res = await fetch("/api/mainmenu", { cache: "no-store" });
        if (!res.ok) {
          setMainMenu(null);
          return;
        }

        const data = await res.json();
        if (data?.titlePrimary && data?.mainPhoto) {
          setMainMenu({
            titlePrimary: data.titlePrimary,
            mainPhoto: data.mainPhoto,
            mainParagraph: data.mainParagraph || "",
          });
        } else {
          setMainMenu(null);
        }
      } catch {
        setMainMenu(null);
      }
    };

    if (!selectedBlog) {
      fetchMainMenu();
    }
  }, [selectedBlog]);

  useEffect(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const newFilteredBlogs = blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(lowerCaseSearch) ||
        blog.description.toLowerCase().includes(lowerCaseSearch)
    );
    setFilteredBlogs(newFilteredBlogs);
  }, [searchTerm, blogs]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
        <p className="p-6 text-gray-500 dark:text-gray-400 animate-pulse text-xl">
          Bloglar yükleniyor...
        </p>
      </div>
    );
  if (blogs.length === 0)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
        <p className="p-6 text-gray-500 dark:text-gray-400 text-xl">
          Henüz blog yok.
        </p>
      </div>
    );

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen p-4 md:p-8 gap-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
        {/* Sol Menü */}
        <aside className="hidden md:flex md:w-[320px] flex-shrink-0 p-6 overflow-y-auto bg-white dark:bg-gray-800 shadow-xl transition-all duration-500 rounded-3xl">
          <div className="flex flex-col w-full">
            <h1 className="text-3xl font-serif text-gray-900 dark:text-white mb-4 tracking-tight">
              Bloglar
            </h1>
            {/* Arama Kutusu */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Ara..."
                className="w-full pl-10 pr-4 py-2 rounded-3xl border-2 border-gray-300 dark:border-gray-700 focus-visible:ring-blue-500 transition-colors duration-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {filteredBlogs.length > 0 ? (
                <Accordion
                  type="single"
                  collapsible
                  className="space-y-4 text-left"
                  value={openAccordion}
                  onValueChange={(value) => setOpenAccordion(value)}
                >
                  {filteredBlogs.map((b, index) => (
                    <motion.div
                      key={b.id || `blog-${index}`}
                      variants={itemVariants}
                      ref={(el: HTMLDivElement | null) => {
                        if (b.id) blogRefs.current[b.id] = el;
                      }}
                    >
                      <AccordionItem
                        value={b.id || `blog-${index}`}
                        className={`
              rounded-3xl border border-gray-200 dark:border-gray-700 
              bg-white dark:bg-gray-800 shadow-md hover:shadow-xl 
              transition-all duration-300 transform hover:-translate-y-1
              ${
                selectedBlog?.id === b.id
                  ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/50"
                  : ""
              }
            `}
                      >
                        <AccordionTrigger
                          className="flex justify-between items-center w-full px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 cursor-pointer text-left"
                          onClick={() => {
                            setSelectedBlog(b);
                            setOpenAccordion(b.id);
                          }}
                        >
                          <div className="flex flex-grow items-center gap-2 overflow-hidden pr-2">
                            <Newspaper className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <span className="truncate">{b.title}</span>
                          </div>
                          {b.paragraph && (
                            <span className="flex items-center gap-1 text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 flex-shrink-0">
                              <Timer className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                              <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {calculateReadingTime(b.paragraph)} dk.
                              </span>
                            </span>
                          )}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 text-gray-600 dark:text-gray-300 leading-relaxed break-words">
                          <p>{b.description}</p>
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center text-gray-400 dark:text-gray-500 mt-4">
                  Sonuç bulunamadı.
                </p>
              )}
            </motion.div>
          </div>
        </aside>

        {/* Mobile Menü Butonu (SheetTrigger) */}
        <div className="md:hidden fixed top-[5rem] left-4 z-50">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="
          rounded-full p-3 shadow-lg transition-all duration-300 
          hover:scale-110 hover:shadow-xl
          bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white
          dark:bg-gray-800/60 dark:backdrop-blur-md dark:border dark:border-gray-700 dark:text-gray-100
        "
              >
                <AlignJustify className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-900 flex flex-col p-4 rounded-r-3xl overflow-y-auto"
            >
              <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                <SheetTitle className="text-xl font-serif text-gray-900 dark:text-white">
                  Bloglar
                </SheetTitle>
              </header>
              <SheetDescription className="sr-only">
                Buradan blog başlıklarını seçebilirsiniz.
              </SheetDescription>

              <div className="relative mb-5 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Ara..."
                  className="w-full pl-9 pr-4 py-2 rounded-2xl border border-gray-300 dark:border-gray-700 focus-visible:ring-blue-500 transition-colors duration-300 bg-gray-50 dark:bg-gray-700 text-sm md:text-base text-gray-900 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <ScrollArea className="flex-1 -mr-4 pr-4">
                {" "}
                {/* Adjusted for scrollbar */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3 text-left"
                >
                  {filteredBlogs.length > 0 ? (
                    <Accordion
                      type="single"
                      collapsible
                      className="space-y-3 text-left w-full"
                      value={openAccordion}
                      onValueChange={(value) => {
                        setOpenAccordion(value);
                      }}
                    >
                      {filteredBlogs.map((b) => (
                        <motion.div key={b.id} variants={itemVariants}>
                          <AccordionItem
                            value={b.id}
                            className={`
                            rounded-2xl border border-gray-200 dark:border-gray-700 
                            bg-white dark:bg-gray-800 shadow-sm hover:shadow-md 
                            transition-all duration-300 
                            ${
                              selectedBlog?.id === b.id
                                ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/40"
                                : ""
                            }
                          `}
                            style={
                              selectedBlog?.id === b.id
                                ? {
                                    borderRadius: "1rem",
                                    outline: "none",
                                  }
                                : {}
                            }
                          >
                            <AccordionTrigger
                              className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 cursor-pointer text-left"
                              onClick={() => {
                                setSelectedBlog(b);
                              }}
                            >
                              {/* Accordion Trigger içeriği */}
                              <div className="flex flex-1 items-center gap-2 overflow-hidden pr-2">
                                <Newspaper className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span className="flex-grow min-w-0 break-words line-clamp-1">
                                  {b.title}
                                </span>
                              </div>
                              {b.paragraph && (
                                <div className="flex items-center gap-1 text-xs font-normal text-gray-500 dark:text-gray-400 ml-auto flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
                                  <Timer className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                                    {calculateReadingTime(b.paragraph)} dk.
                                  </span>
                                </div>
                              )}
                            </AccordionTrigger>
                            <AccordionContent className="px-3 pb-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed break-words">
                              <p>{b.description}</p>
                            </AccordionContent>
                          </AccordionItem>
                        </motion.div>
                      ))}
                    </Accordion>
                  ) : (
                    <p className="text-center text-gray-400 dark:text-gray-500 mt-4 text-sm">
                      Sonuç bulunamadı.
                    </p>
                  )}
                </motion.div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sağ Detay Alanı */}
        <main className="flex-grow p-6 overflow-y-auto max-w-full bg-gray-50 dark:bg-gray-900 rounded-3xl transition-all duration-500 shadow-inner">
          {selectedBlog ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              {/* Main Photo */}
              <Card className="overflow-hidden shadow-2xl bg-white dark:bg-gray-800 rounded-3xl">
                <div className="relative w-full h-[450px] max-w-full">
                  <img
                    src={selectedBlog.mainPhoto}
                    alt={selectedBlog.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg break-words">
                      {selectedBlog.title}
                    </h2>
                    <p className="text-lg md:text-xl text-gray-200 mt-2 drop-shadow break-words">
                      {selectedBlog.description}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Güncellenmiş shortText alanı */}
              {selectedBlog.shortText && (
                <div className="p-6 bg-blue-400 dark:bg-gray-800 rounded-2xl shadow-lg transform translate-y-2 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-2xl font-bold text-white dark:text-gray-200 leading-snug break-words">
                    {selectedBlog.shortText}
                  </h3>
                </div>
              )}

              {/* Paragraf */}
              {selectedBlog.paragraph && (
                <Card className="shadow-lg bg-white dark:bg-gray-800 rounded-xl">
                  <CardContent className="pt-6">
                    <p className="text-gray-800 dark:text-gray-300 text-lg md:text-xl leading-relaxed tracking-wide break-words">
                      {selectedBlog.paragraph}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Carousel */}
              {selectedBlog.images.length > 0 && (
                <Card className="shadow-xl bg-white dark:bg-gray-800 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                      Fotoğraflar
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Ek görselleri inceleyin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <div
                      ref={carouselRef}
                      className="flex gap-6 py-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800"
                      onScroll={handleScroll}
                    >
                      {selectedBlog.images.map((img, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="snap-center flex-shrink-0 w-80 h-56 rounded-xl shadow-lg overflow-hidden cursor-pointer group"
                          onClick={() => openLightbox(i)}
                        >
                          <img
                            src={img}
                            alt={`Ek Foto ${i}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </motion.div>
                      ))}
                    </div>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => scrollBy(-320)}
                        className="bg-gray-900/60 hover:bg-gray-900/80 text-white rounded-full shadow-lg transition-all duration-300"
                      >
                        <ChevronLeft className="w-8 h-8" />
                      </Button>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => scrollBy(320)}
                        className="bg-gray-900/60 hover:bg-gray-900/80 text-white rounded-full shadow-lg transition-all duration-300"
                      >
                        <ChevronRight className="w-8 h-8" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lightbox for images */}
              <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="p-0 border-none bg-transparent max-w-4xl w-full">
                  <DialogTitle className="sr-only">
                    Fotoğrafı Tam Ekran Görüntüleme
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Fotoğrafı büyütülmüş olarak görebilir ve diğer fotoğraflara
                    geçebilirsiniz.
                  </DialogDescription>
                  <div className="relative">
                    <img
                      src={selectedBlog?.images[lightboxIndex]}
                      alt="Lightbox"
                      className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                    />
                    <div className="absolute top-1/2 left-4 -translate-y-1/2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevImage}
                        className="bg-black/50 hover:bg-black/70 rounded-full text-white"
                      >
                        <ChevronLeft className="w-8 h-8" />
                      </Button>
                    </div>
                    <div className="absolute top-1/2 right-4 -translate-y-1/2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextImage}
                        className="bg-black/50 hover:bg-black/70 rounded-full text-white"
                      >
                        <ChevronRight className="w-8 h-8" />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Separator className="my-10 h-1 bg-gray-200 dark:bg-gray-700" />
              {/* Tarih ve Sosyal Medya Paylaşım Butonları */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-gray-600 dark:text-gray-300">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    <span className="font-medium text-sm">
                      Yayınlanma: {formatDate(selectedBlog.createdAt)}
                    </span>
                  </div>
                  {selectedBlog.updatedAt && (
                    <div className="flex items-center gap-2 sm:ml-4">
                      <History className="w-5 h-5" />
                      <span className="font-medium text-sm">
                        Güncelleme: {formatDate(selectedBlog.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <p className="font-semibold text-sm">Paylaş:</p>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareBlog("twitter")}
                      className="rounded-full text-blue-500 hover:bg-blue-500/10 transition-colors duration-200 p-1 h-auto min-w-0"
                    >
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareBlog("linkedin")}
                      className="rounded-full text-blue-700 hover:bg-blue-700/10 transition-colors duration-200 p-1 h-auto min-w-0"
                    >
                      <Linkedin className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareBlog("facebook")}
                      className="rounded-full text-blue-600 hover:bg-blue-600/10 transition-colors duration-200 p-1 h-auto min-w-0"
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {/* Yorumlar */}
              {selectedBlog.commentsAllowed ? (
                <Card className="shadow-lg bg-white dark:bg-gray-800 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
                      Yorumlar 💬
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Blog hakkındaki görüşlerinizi paylaşın
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedBlog.comments.length > 0 ? (
                      <>
                        <div
                          className="max-h-[250px] overflow-y-auto space-y-4 pr-4"
                          ref={commentsScrollAreaRef}
                        >
                          {selectedBlog.comments.map((c, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1, duration: 0.3 }}
                              className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700
                                p-4 rounded-lg shadow-sm transition-all duration-300
                                hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <MessageCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                              <div className="flex-1 overflow-hidden">
                                <p
                                  className="w-full text-gray-900 dark:text-white font-medium leading-snug 
                                    whitespace-pre-wrap break-all"
                                >
                                  {c.text}
                                </p>
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-mono mt-1">
                                  {formatDateTime(c.createdAt)}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500 text-center py-4">
                        Henüz yorum yapılmamış. İlk yorumu siz yapın!
                      </p>
                    )}

                    <div className="flex items-start space-x-2 pt-4">
                      {/* Yorum Yazma Kutusu */}
                      <Textarea
                        ref={(el) => {
                          if (selectedBlog)
                            textareaRefs.current[selectedBlog.id] = el;
                        }}
                        placeholder="Bir yorum yazın..."
                        value={newComments[selectedBlog.id] || ""}
                        onChange={(e) =>
                          handleCommentChange(selectedBlog.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleAddComment(selectedBlog.id);
                          }
                        }}
                        className="flex-grow rounded-2xl border-2 border-gray-300 dark:border-gray-700
          bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
          focus-visible:ring-blue-500 transition-colors duration-300
          resize-none overflow-y-auto max-h-40 min-h-[40px]"
                        disabled={addingComment[selectedBlog.id]}
                        rows={1}
                      />
                      <Button
                        onClick={() => handleAddComment(selectedBlog.id)}
                        disabled={
                          addingComment[selectedBlog.id] ||
                          !newComments[selectedBlog.id]
                        }
                        className="rounded-2xl bg-blue-500 hover:bg-blue-600
          transition-colors duration-300 text-white font-semibold flex-shrink-0"
                      >
                        Gönder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="shadow-lg bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                    Bu blogda yorumlar kapalıdır.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Giriş görseli + başlık + paragraf (MainMenu) */}
              <Card className="overflow-hidden shadow-2xl bg-white dark:bg-gray-800 rounded-3xl">
                <div className="relative w-full h-[450px] max-w-full">
                  <img
                    src={
                      mainMenu?.mainPhoto && mainMenu.mainPhoto.trim() !== ""
                        ? mainMenu.mainPhoto
                        : "https://placehold.co/1600x900/jpg"
                    }
                    alt="Kapak görseli"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg break-words">
                      {mainMenu?.titlePrimary || "Hoş geldiniz"}
                    </h2>
                  </div>
                </div>
              </Card>

              {/* ✅ mainParagraph buraya ekle */}
              {mainMenu?.mainParagraph && (
                <Card className="shadow-lg bg-white dark:bg-gray-800 rounded-xl">
                  <CardContent className="pt-6">
                    <p className="text-gray-800 dark:text-gray-300 text-lg md:text-xl leading-relaxed tracking-wide break-words">
                      {mainMenu.mainParagraph}
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* Modern Alert Dialog */}
      <AlertDialog
        open={alert.open}
        onOpenChange={() => setAlert({ ...alert, open: false })}
      >
        <AlertDialogContent className="max-w-[90%] sm:max-w-lg rounded-2xl p-6 bg-white dark:bg-gray-800 border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400 flex-shrink-0" />
              <AlertDialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {alert.title}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              {alert.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogAction
              onClick={() => setAlert({ ...alert, open: false })}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-semibold transition-colors duration-300"
            >
              Tamam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
