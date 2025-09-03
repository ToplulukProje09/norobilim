"use client";

import { useEffect, useState } from "react";
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
import {
  PlusCircle,
  Trash2,
  Edit,
  ArrowLeft,
  CalendarDays,
  Briefcase,
  Users,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Search,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Custom Toast/Modal component for errors
const ErrorModal = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-sm text-center transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center mb-4">
          <svg
            className="w-16 h-16 text-red-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
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
};

interface Role {
  id: string;
  title: string;
  organization: string;
  startDate?: string;
  endDate?: string;
}

interface SocialMediaLink {
  platform: "Instagram" | "Twitter" | "LinkedIn" | "Github";
  url: string;
}

interface Person {
  id: string;
  name: string;
  class: string;
  department: string;
  photo: string;
  roles: Role[];
  socialMedia?: Record<string, string>; // Schema'nızdaki Json tipini buraya uyarladım
}

export default function AdminPerson({
  persons: initialPersons,
}: {
  persons: Person[];
}) {
  const router = useRouter();
  const [persons, setPersons] = useState<Person[]>(initialPersons);
  const [loading, setLoading] = useState(false);
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);
  const [currentPersonIdForNewRole, setCurrentPersonIdForNewRole] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  // Arama ve filtreleme için yeni state'ler
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  useEffect(() => {
    setPersons(initialPersons);
  }, [initialPersons]);

  // Benzersiz sınıfları alıyoruz (hardcoded ve veri tabanından gelenlerin hepsi tekilleştirildi)
  const allClasses = [
    "Hazırlık",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    ...persons.map((p) => p.class),
  ];
  const uniqueClasses = Array.from(new Set(allClasses));

  const uniqueDepartments = Array.from(
    new Set(persons.map((p) => p.department))
  );

  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-5 w-5" />;
      case "twitter":
        return <Twitter className="h-5 w-5" />;
      case "linkedin":
        return <Linkedin className="h-5 w-5" />;
      case "github":
        return <Github className="h-5 w-5" />;
      default:
        return null;
    }
  };

  async function deletePerson(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/persons/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Kişi silme işlemi başarısız oldu.");
      }
      setPersons(persons.filter((p) => p.id !== id));
      router.refresh(); // Anında güncelleme için
    } catch (error) {
      console.error("Failed to delete person:", error);
      setError("Kişi silinirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  const handleRoleUpdate = async (updatedRole: Role) => {
    const startDate = updatedRole.startDate
      ? new Date(updatedRole.startDate)
      : undefined;
    const endDate = updatedRole.endDate
      ? new Date(updatedRole.endDate)
      : undefined;

    if (startDate && endDate && startDate > endDate) {
      setError("Bitiş tarihi başlangıç tarihinden önce olamaz!");
      return;
    }

    try {
      const res = await fetch(`/api/roles/${updatedRole.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRole),
      });

      if (!res.ok) {
        throw new Error("Rol güncelleme başarısız oldu.");
      }

      const updatedData = await res.json();

      setPersons((prevPersons) =>
        prevPersons.map((person) => {
          if (person.roles.some((role) => role.id === updatedData.id)) {
            return {
              ...person,
              roles: person.roles.map((role) =>
                role.id === updatedData.id ? updatedData : role
              ),
            };
          }
          return person;
        })
      );
      router.refresh(); // Anında güncelleme için
    } catch (error) {
      console.error("Rol güncellenirken bir hata oluştu:", error);
      setError("Rol güncellenirken bir hata oluştu.");
    }
  };

  const handleRoleDelete = async (roleId: string, personId: string) => {
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Rol silme başarısız oldu.");
      }

      setPersons((prevPersons) =>
        prevPersons.map((person) =>
          person.id === personId
            ? {
                ...person,
                roles: person.roles.filter((role) => role.id !== roleId),
              }
            : person
        )
      );
      router.refresh(); // Anında güncelleme için
    } catch (error) {
      console.error("Rol silinirken bir hata oluştu:", error);
      setError("Rol silinirken bir hata oluştu.");
    }
  };

  const handleNewRoleSubmit = async (e: React.FormEvent, personId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;

    // Yalnızca startDate varsa ve endDate da varsa tarih kontrolü yapılır
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("Bitiş tarihi başlangıç tarihinden önce olamaz!");
      return;
    }

    const newRoleData = {
      personId,
      title: formData.get("title"),
      organization: formData.get("organization"),
      startDate: startDate || null,
      endDate: endDate || null,
    };

    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRoleData),
      });

      if (!res.ok) {
        throw new Error("Yeni rol eklenirken bir hata oluştu.");
      }

      const addedRole = await res.json();

      setPersons((prevPersons) =>
        prevPersons.map((person) =>
          person.id === personId
            ? { ...person, roles: [...person.roles, addedRole] }
            : person
        )
      );

      setIsNewRoleDialogOpen(false);
      router.refresh(); // Anında güncelleme için
    } catch (error) {
      console.error("Yeni rol eklenirken bir hata oluştu:", error);
      setError("Yeni rol eklenirken bir hata oluştu.");
    }
  };

  const formatRoleDates = (startDate?: string, endDate?: string) => {
    const start = startDate
      ? new Date(startDate).toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Belirtilmemiş";
    const end = endDate
      ? new Date(endDate).toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Devam Ediyor";
    return `${start} - ${end}`;
  };

  // Kişileri arama terimine ve filtreleme seçeneklerine göre filtreliyoruz
  const filteredPersons = persons.filter((person) => {
    const matchesSearch =
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === "all" || person.class === selectedClass;
    const matchesDepartment =
      selectedDepartment === "all" || person.department === selectedDepartment;
    return matchesSearch && matchesClass && matchesDepartment;
  });

  if (loading) {
    return (
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
            Kişiler yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (!persons || persons.length === 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center space-y-6 p-4 text-center bg-background">
        <Users className="h-24 w-24 text-muted-foreground opacity-30" />
        <h2 className="text-2xl font-bold text-muted-foreground">
          Henüz hiç kişi eklenmemiş. 😔
        </h2>
        <Button onClick={() => router.push("/adminpersons/new")} size="lg">
          <PlusCircle className="mr-2 h-5 w-5" /> Yeni Kişi Ekle
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-background text-foreground">
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 space-y-4 sm:space-y-0">
        <h1 className="text-4xl font-extrabold tracking-tight text-center sm:text-left">
          Kişi Yönetimi ✨
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
            onClick={() => router.push("/adminpersons/new")}
            className="group"
          >
            <PlusCircle className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />{" "}
            Yeni Kişi Ekle
          </Button>
        </div>
      </div>
      <Separator className="mb-10" />
      {/* Arama ve Filtreleme Bölümü - Güncellendi */}
      <div className="mb-8 flex flex-col md:flex-row items-center md:justify-center gap-4">
        {/* Arama Çubuğu */}
        <div className="relative w-full md:w-1/2">
          <Input
            type="text"
            placeholder="Ada veya bölüme göre ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>
        {/* Sınıf Filtresi */}
        <Select
          onValueChange={(value) => setSelectedClass(value)}
          value={selectedClass}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sınıfı Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Sınıflar</SelectItem>
            {uniqueClasses
              .filter((sınıf) => sınıf && sınıf.trim() !== "") // 👈 boşları filtrele
              .map((sınıf) => (
                <SelectItem key={sınıf} value={sınıf}>
                  {sınıf}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Departman Filtresi */}
        <Select
          onValueChange={(value) => setSelectedDepartment(value)}
          value={selectedDepartment}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Bölümü Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Bölümler</SelectItem>
            {uniqueDepartments
              .filter((department) => department && department.trim() !== "") // 👈 boşları filtrele
              .map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredPersons.length > 0 ? (
          filteredPersons.map((p) => {
            return (
              <Card
                key={p.id}
                className="flex flex-col h-full overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-gray-800 border-2"
              >
                <CardHeader className="flex flex-col items-center p-4 pb-2">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-primary/20 mb-3 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    {p.photo ? (
                      <Image
                        src={p.photo}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                    ) : (
                      <svg
                        className="w-20 h-20 text-gray-400 dark:text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993c-.45-.733-1.636-1.92-2.585-2.868-1.077-1.078-2.618-1.423-4.136-1.423-1.517 0-3.058.345-4.136 1.423-.949.948-2.135 2.135-2.585 2.868-.582.946-1.517.946-2.1 0-.45-.733-1.636-1.92-2.585-2.868-1.077-1.078-2.618-1.423-4.136-1.423-1.517 0-3.058.345-4.136 1.423-.949.948-2.135 2.135-2.585 2.868-.582.946-.66.946-.66 0s-.078-1.92-.66-2.868c-.45-.733-1.636-1.92-2.585-2.868-1.077-1.078-2.618-1.423-4.136-1.423-1.517 0-3.058.345-4.136 1.423-.949.948-2.135 2.135-2.585 2.868-.582.946-1.517.946-2.1 0zM12 12c-3.313 0-6 2.687-6 6h12c0-3.313-2.687-6-6-6z" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                  <div className="text-center w-full">
                    {/* 👇️ Değişiklik: line-clamp-2 kaldırıldı, metnin alt satıra inmesi sağlandı. */}
                    <CardTitle className="text-xl font-bold">
                      {p.name}
                    </CardTitle>
                    <CardDescription className="flex flex-col items-center justify-center space-y-1 mt-1 text-center">
                      <Badge variant="secondary" className="text-xs">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {p.department}
                      </Badge>
                      <Badge className="text-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md">
                        <Users className="h-4 w-4 mr-1" />
                        Sınıf: {p.class}
                      </Badge>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-grow flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-lg text-primary">
                      Roller
                    </h4>
                    <Dialog
                      onOpenChange={setIsNewRoleDialogOpen}
                      open={
                        isNewRoleDialogOpen &&
                        currentPersonIdForNewRole === p.id
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCurrentPersonIdForNewRole(p.id)}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Yeni Rol Ekle</DialogTitle>
                          <DialogDescription>
                            Bu kişi için yeni bir rol oluşturmak için formu
                            doldurun.
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          className="grid gap-4 py-4"
                          onSubmit={(e) => handleNewRoleSubmit(e, p.id)}
                        >
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-title" className="text-right">
                              Unvan
                            </Label>
                            <Input
                              id="new-title"
                              name="title"
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="new-organization"
                              className="text-right"
                            >
                              Kurum
                            </Label>
                            <Input
                              id="new-organization"
                              name="organization"
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="new-startDate"
                              className="text-right"
                            >
                              Başlangıç
                            </Label>
                            <Input
                              id="new-startDate"
                              name="startDate"
                              type="date"
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-endDate" className="text-right">
                              Bitiş
                            </Label>
                            <Input
                              id="new-endDate"
                              name="endDate"
                              type="date"
                              className="col-span-3"
                            />
                          </div>
                          <div className="flex justify-end pt-4">
                            <Button type="submit">Rol Ekle</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex flex-col gap-3">
                    {p.roles && p.roles.length > 0 ? (
                      p.roles.map((r, index) => (
                        <div
                          key={index}
                          className="flex flex-col p-3 border rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="default"
                                className="text-lg font-bold text-primary-foreground bg-primary/80 hover:bg-primary"
                              >
                                {r.title}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Rolü Düzenle</DialogTitle>
                                    <DialogDescription>
                                      Rol bilgilerini güncellemek için aşağıdaki
                                      formu kullanın.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form
                                    className="grid gap-4 py-4"
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      const formData = new FormData(
                                        e.currentTarget as HTMLFormElement
                                      );
                                      const updatedData: Role = {
                                        id: r.id,
                                        title: formData.get("title") as string,
                                        organization: formData.get(
                                          "organization"
                                        ) as string,
                                        startDate: formData.get(
                                          "startDate"
                                        ) as string,
                                        endDate:
                                          (formData.get("endDate") as string) ||
                                          undefined,
                                      };
                                      handleRoleUpdate(updatedData);
                                    }}
                                  >
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="title"
                                        className="text-right"
                                      >
                                        Unvan
                                      </Label>
                                      <Input
                                        id="title"
                                        name="title"
                                        defaultValue={r.title}
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="organization"
                                        className="text-right"
                                      >
                                        Kurum
                                      </Label>
                                      <Input
                                        id="organization"
                                        name="organization"
                                        defaultValue={r.organization}
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="startDate"
                                        className="text-right"
                                      >
                                        Başlangıç
                                      </Label>
                                      <Input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        defaultValue={
                                          r.startDate
                                            ? new Date(r.startDate)
                                                .toISOString()
                                                .split("T")[0]
                                            : ""
                                        }
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="endDate"
                                        className="text-right"
                                      >
                                        Bitiş
                                      </Label>
                                      <Input
                                        id="endDate"
                                        name="endDate"
                                        type="date"
                                        defaultValue={
                                          r.endDate
                                            ? new Date(r.endDate)
                                                .toISOString()
                                                .split("T")[0]
                                            : ""
                                        }
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                      <DialogClose asChild>
                                        <Button type="submit">Kaydet</Button>
                                      </DialogClose>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Bu rolü silmek istediğine emin misin?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu işlem geri alınamaz. Rol kalıcı olarak
                                      silinecektir.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleRoleDelete(r.id, p.id)
                                      }
                                    >
                                      Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          {/* 👇️ Kurum adı daha küçük ve alt satırda */}
                          <span className="text-xs font-medium text-foreground opacity-80 mt-1">
                            {r.organization}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-muted-foreground flex items-center mt-1">
                                  <CalendarDays className="h-3 w-3 mr-1" />
                                  {formatRoleDates(r.startDate, r.endDate)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Başlangıç:{" "}
                                  {r.startDate
                                    ? new Date(r.startDate).toLocaleDateString(
                                        "tr-TR"
                                      )
                                    : "Belirtilmemiş"}
                                </p>
                                <p>
                                  Bitiş:{" "}
                                  {r.endDate
                                    ? new Date(r.endDate).toLocaleDateString(
                                        "tr-TR"
                                      )
                                    : "Devam Ediyor"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center p-3 rounded-md border-2 border-dashed text-center text-muted-foreground">
                        <span className="text-sm">Hiç rol atanmamış.</span>
                      </div>
                    )}
                  </div>
                  {/* Social Media Section */}
                  {p.socialMedia && Object.keys(p.socialMedia).length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {Object.keys(p.socialMedia).map((platform) => {
                        const IconComponent = getIcon(platform);
                        if (!IconComponent) return null;
                        const url = p.socialMedia?.[platform];
                        if (!url) return null;

                        return (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 rounded-full text-white transition-colors duration-200"
                            style={{
                              backgroundColor:
                                platform.toLowerCase() === "instagram"
                                  ? "#E1306C"
                                  : platform.toLowerCase() === "twitter"
                                  ? "#1DA1F2"
                                  : platform.toLowerCase() === "linkedin"
                                  ? "#0A66C2"
                                  : platform.toLowerCase() === "github"
                                  ? "#333"
                                  : "#6b7280",
                            }}
                          >
                            {IconComponent}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
                <div className="flex justify-end p-4 pt-0 gap-3">
                  <Button
                    onClick={() => router.push(`/adminpersons/${p.id}`)}
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
                          Bu kişiyi silmek istediğine emin misin?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu işlem geri alınamaz. Kişi kalıcı olarak
                          silinecektir.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletePerson(p.id)}>
                          Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <p className="text-xl text-muted-foreground">
              Arama kriterlerinize uygun kişi bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
