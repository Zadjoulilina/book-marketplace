import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoute, useLocation } from "wouter";
import { Upload, Loader2, BookOpen } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

const CATEGORIES = ["Fiction", "Non-Fiction", "Science", "Technology", "History", "Philosophy", "Art", "Business", "Education", "Biography", "Children", "Other"];

export default function EditBook() {
  const [, params] = useRoute("/edit-book/:id");
  const bookId = Number(params?.id);
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: book, isLoading } = trpc.books.getById.useQuery({ id: bookId }, { enabled: !!bookId });

  const [form, setForm] = useState({
    title: "", description: "", isbn: "", price: "", originalPrice: "",
    condition: "", category: "", language: "",
    pageCount: "", publishYear: "", listingType: "",
    authorName: "", publisherName: "",
  });
  const [coverUrl, setCoverUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (book && !initialized) {
      setForm({
        title: book.title || "",
        description: book.description || "",
        isbn: book.isbn || "",
        price: book.price || "",
        originalPrice: book.originalPrice || "",
        condition: book.condition || "",
        category: book.category || "",
        language: book.language || "",
        pageCount: book.pageCount ? String(book.pageCount) : "",
        publishYear: book.publishYear ? String(book.publishYear) : "",
        listingType: book.listingType || "",
        authorName: book.authorName || "",
        publisherName: book.publisherName || "",
      });
      setCoverUrl(book.coverImageUrl || "");
      setInitialized(true);
    }
  }, [book, initialized]);

  const uploadCover = trpc.books.uploadCover.useMutation();
  const updateBook = trpc.books.update.useMutation({
    onSuccess: () => {
      toast.success("Book updated!");
      navigate(`/book/${bookId}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const result = await uploadCover.mutateAsync({ fileName: file.name, fileBase64: base64, contentType: file.type });
        setCoverUrl(result.url);
        toast.success("Cover uploaded!");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch { toast.error("Upload failed"); setUploading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBook.mutate({
      id: bookId,
      ...form,
      coverImageUrl: coverUrl || undefined,
      pageCount: form.pageCount ? Number(form.pageCount) : undefined,
      publishYear: form.publishYear ? Number(form.publishYear) : undefined,
      condition: form.condition as any,
      listingType: form.listingType as any,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col"><Navbar /><div className="container py-8 flex-1"><Skeleton className="h-8 w-48 mb-6" /><Skeleton className="h-96" /></div><Footer /></div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container flex-1">
        <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Edit Book" }]} />
        <div className="max-w-3xl mx-auto pb-12">
          <h1 className="text-2xl font-bold font-[Playfair_Display] mb-6">Edit Book</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Cover Image</CardTitle></CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                  {coverUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={coverUrl} alt="Cover" className="h-48 object-contain rounded" />
                      <p className="text-sm text-muted-foreground">Click to change</p>
                    </div>
                  ) : uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Upload cover image</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Book Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div><Label>Author</Label><Input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} /></div>
                </div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div><Label>ISBN</Label><Input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} /></div>
                  <div><Label>Publisher</Label><Input value={form.publisherName} onChange={(e) => setForm({ ...form, publisherName: e.target.value })} /></div>
                  <div><Label>Language</Label><Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} /></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Page Count</Label><Input type="number" value={form.pageCount} onChange={(e) => setForm({ ...form, pageCount: e.target.value })} /></div>
                  <div><Label>Publish Year</Label><Input type="number" value={form.publishYear} onChange={(e) => setForm({ ...form, publishYear: e.target.value })} /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Pricing & Listing</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Price ($)</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                  <div><Label>Original Price ($)</Label><Input type="number" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} /></div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Condition</Label>
                    <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like_new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Listing Type</Label>
                    <Select value={form.listingType} onValueChange={(v) => setForm({ ...form, listingType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sell">For Sale</SelectItem>
                        <SelectItem value="lend">For Lending</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>Cancel</Button>
              <Button type="submit" disabled={updateBook.isPending} className="gap-2">
                {updateBook.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
