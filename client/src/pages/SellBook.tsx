import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Upload, BookOpen, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { getLoginUrl } from "@/const";

const CATEGORIES = ["Fiction", "Non-Fiction", "Science", "Technology", "History", "Philosophy", "Art", "Business", "Education", "Biography", "Children", "Other"];

export default function SellBook() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", description: "", isbn: "", price: "", originalPrice: "",
    condition: "" as string, category: "", language: "English",
    pageCount: "", publishYear: "", listingType: "sell" as string,
    authorName: "", publisherName: "",
  });
  const [coverUrl, setCoverUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadCover = trpc.books.uploadCover.useMutation();
  const createBook = trpc.books.create.useMutation({
    onSuccess: (data) => {
      toast.success("Book listed successfully!");
      navigate(`/book/${data.id}`);
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
        const result = await uploadCover.mutateAsync({
          fileName: file.name,
          fileBase64: base64,
          contentType: file.type,
        });
        setCoverUrl(result.url);
        toast.success("Cover uploaded!");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Upload failed");
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.condition || !form.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    createBook.mutate({
      ...form,
      coverImageUrl: coverUrl || undefined,
      pageCount: form.pageCount ? Number(form.pageCount) : undefined,
      publishYear: form.publishYear ? Number(form.publishYear) : undefined,
      condition: form.condition as any,
      listingType: form.listingType as any,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-16 text-center flex-1">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to list a book.</p>
          <a href={getLoginUrl()}><Button>Sign In</Button></a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container flex-1">
        <Breadcrumb items={[{ label: "List a Book" }]} />

        <div className="max-w-3xl mx-auto pb-12">
          <h1 className="text-2xl font-bold font-[Playfair_Display] mb-6">List a Book</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Image */}
            <Card>
              <CardHeader><CardTitle className="text-base">Cover Image</CardTitle></CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {coverUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={coverUrl} alt="Cover" className="h-48 object-contain rounded" />
                      <p className="text-sm text-muted-foreground">Click to change</p>
                    </div>
                  ) : uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload cover image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </CardContent>
            </Card>

            {/* Book Details */}
            <Card>
              <CardHeader><CardTitle className="text-base">Book Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Title *</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Book title" />
                  </div>
                  <div>
                    <Label>Author</Label>
                    <Input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} placeholder="Author name" />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the book..." rows={4} />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>ISBN</Label>
                    <Input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} placeholder="978-..." />
                  </div>
                  <div>
                    <Label>Publisher</Label>
                    <Input value={form.publisherName} onChange={(e) => setForm({ ...form, publisherName: e.target.value })} placeholder="Publisher name" />
                  </div>
                  <div>
                    <Label>Language</Label>
                    <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Page Count</Label>
                    <Input type="number" value={form.pageCount} onChange={(e) => setForm({ ...form, pageCount: e.target.value })} placeholder="e.g. 320" />
                  </div>
                  <div>
                    <Label>Publish Year</Label>
                    <Input type="number" value={form.publishYear} onChange={(e) => setForm({ ...form, publishYear: e.target.value })} placeholder="e.g. 2023" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Condition */}
            <Card>
              <CardHeader><CardTitle className="text-base">Pricing & Listing</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Price ($) *</Label>
                    <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="9.99" />
                  </div>
                  <div>
                    <Label>Original Price ($)</Label>
                    <Input type="number" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="19.99" />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Condition *</Label>
                    <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                      <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
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
                    <Label>Listing Type *</Label>
                    <Select value={form.listingType} onValueChange={(v) => setForm({ ...form, listingType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sell">For Sale</SelectItem>
                        <SelectItem value="lend">For Lending</SelectItem>
                        <SelectItem value="both">Both (Sell & Lend)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>Cancel</Button>
              <Button type="submit" disabled={createBook.isPending} className="gap-2">
                {createBook.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                List Book
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
