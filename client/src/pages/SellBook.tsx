import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Upload, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { getLoginUrl } from "@/const";

const CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "Artificial Intelligence",
  "Computer Science",
  "Cybersecurity",
  "Networks",
  "History",
  "Philosophy",
  "Art",
  "Business",
  "Education",
  "Biography",
  "Children",
  "Religious",
  "Cultural",
  "Literature",
  "Other",
];

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

const LISTING_TYPES = [
  { value: "sell", label: "For Sale" },
  { value: "lend", label: "For Lending" },
  { value: "both", label: "Both (Sell & Lend)" },
];

type FormState = {
  title: string;
  description: string;
  isbn: string;
  price: string;
  originalPrice: string;
  condition: string;
  category: string;
  language: string;
  pageCount: string;
  publishYear: string;
  listingType: string;
  authorName: string;
  publisherName: string;
};

export default function SellBook() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    isbn: "",
    price: "",
    originalPrice: "",
    condition: "",
    category: "",
    language: "English",
    pageCount: "",
    publishYear: "",
    listingType: "sell",
    authorName: "",
    publisherName: "",
  });

  const [coverUrl, setCoverUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

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
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
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

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.price.trim() || isNaN(Number(form.price)) || Number(form.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!form.condition) newErrors.condition = "Condition is required";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.listingType) newErrors.listingType = "Listing type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    createBook.mutate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      isbn: form.isbn.trim() || undefined,
      coverImageUrl: coverUrl || undefined,
      price: form.price,
      originalPrice: form.originalPrice || undefined,
      condition: form.condition as "new" | "like_new" | "good" | "fair" | "poor",
      category: form.category,
      language: form.language || "English",
      pageCount: form.pageCount ? Number(form.pageCount) : undefined,
      publishYear: form.publishYear ? Number(form.publishYear) : undefined,
      listingType: form.listingType as "sell" | "lend" | "both",
      authorName: form.authorName.trim() || undefined,
      publisherName: form.publisherName.trim() || undefined,
    });
  };

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-16 text-center flex-1">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to list a book.</p>
          <a href={getLoginUrl()}>
            <Button>Sign In</Button>
          </a>
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
              <CardHeader>
                <CardTitle className="text-base">Cover Image</CardTitle>
              </CardHeader>
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </CardContent>
            </Card>

            {/* Book Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Book Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setField("title", e.target.value)}
                      placeholder="Book title"
                      className={errors.title ? "border-destructive" : ""}
                    />
                    {errors.title && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.title}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>Author</Label>
                    <Input
                      value={form.authorName}
                      onChange={(e) => setField("authorName", e.target.value)}
                      placeholder="Author name"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Describe the book..."
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>ISBN</Label>
                    <Input
                      value={form.isbn}
                      onChange={(e) => setField("isbn", e.target.value)}
                      placeholder="978-..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Publisher</Label>
                    <Input
                      value={form.publisherName}
                      onChange={(e) => setField("publisherName", e.target.value)}
                      placeholder="Publisher name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Language</Label>
                    <Input
                      value={form.language}
                      onChange={(e) => setField("language", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Page Count</Label>
                    <Input
                      type="number"
                      min="1"
                      value={form.pageCount}
                      onChange={(e) => setField("pageCount", e.target.value)}
                      placeholder="e.g. 320"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Publish Year</Label>
                    <Input
                      type="number"
                      min="1000"
                      max={new Date().getFullYear()}
                      value={form.publishYear}
                      onChange={(e) => setField("publishYear", e.target.value)}
                      placeholder="e.g. 2023"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Condition */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pricing & Listing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>
                      Price ($) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={form.price}
                      onChange={(e) => setField("price", e.target.value)}
                      placeholder="9.99"
                      className={errors.price ? "border-destructive" : ""}
                    />
                    {errors.price && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.price}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>Original Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.originalPrice}
                      onChange={(e) => setField("originalPrice", e.target.value)}
                      placeholder="19.99"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setField("category", v)}
                    >
                      <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label>
                      Condition <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.condition}
                      onValueChange={(v) => setField("condition", v)}
                    >
                      <SelectTrigger className={errors.condition ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.condition && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.condition}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label>
                      Listing Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.listingType}
                      onValueChange={(v) => setField("listingType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LISTING_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createBook.isPending || uploading}
                className="gap-2"
              >
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
