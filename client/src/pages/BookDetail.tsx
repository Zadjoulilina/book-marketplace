import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoute, Link, useLocation } from "wouter";
import {
  BookOpen, Star, ShoppingCart, Library, User, Calendar,
  Hash, Globe, FileText, Tag, ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${interactive ? "cursor-pointer" : ""} ${
            star <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
          }`}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
}

export default function BookDetail() {
  const [, params] = useRoute("/book/:id");
  const bookId = Number(params?.id);
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: book, isLoading } = trpc.books.getById.useQuery({ id: bookId }, { enabled: !!bookId });
  const { data: reviews } = trpc.reviews.byBook.useQuery({ bookId }, { enabled: !!bookId });

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => { toast.success("Added to cart!"); utils.cart.get.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Review submitted!");
      utils.reviews.byBook.invalidate({ bookId });
      utils.books.getById.invalidate({ id: bookId });
      setReviewRating(0);
      setReviewComment("");
    },
    onError: (err) => toast.error(err.message),
  });

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const handleBorrow = () => {
    navigate(`/borrow/${bookId}`);
  };

  const handleSubmitReview = () => {
    if (reviewRating === 0) { toast.error("Please select a rating"); return; }
    createReview.mutate({ bookId, rating: reviewRating, comment: reviewComment || undefined });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-8 flex-1">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-[3/4] rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-16 text-center flex-1">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Book Not Found</h2>
          <p className="text-muted-foreground mb-4">The book you're looking for doesn't exist.</p>
          <Link href="/marketplace"><Button>Browse Marketplace</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const canBuy = book.status === "available" && (book.listingType === "sell" || book.listingType === "both");
  const canBorrow = book.status === "available" && (book.listingType === "lend" || book.listingType === "both");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container flex-1">
        <Breadcrumb items={[
          { label: "Marketplace", href: "/marketplace" },
          { label: book.title },
        ]} />

        <div className="grid md:grid-cols-5 gap-8 pb-12">
          {/* Cover Image */}
          <div className="md:col-span-2">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted sticky top-24">
              {book.coverImageUrl ? (
                <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <BookOpen className="h-20 w-20 text-primary/30" />
                </div>
              )}
            </div>
          </div>

          {/* Book Info */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge>{book.category}</Badge>
                <Badge variant="outline" className="capitalize">{book.condition?.replace("_", " ")}</Badge>
                <Badge variant={book.status === "available" ? "default" : "secondary"} className="capitalize">
                  {book.status}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold font-[Playfair_Display] mb-2">{book.title}</h1>
              <p className="text-lg text-muted-foreground">by {book.authorName || "Unknown Author"}</p>

              {/* Rating */}
              {book.rating && book.rating.count > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <StarRating rating={Math.round(book.rating.avg)} />
                  <span className="text-sm text-muted-foreground">
                    {Number(book.rating.avg).toFixed(1)} ({book.rating.count} review{book.rating.count !== 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">${book.price}</span>
              {book.originalPrice && Number(book.originalPrice) > Number(book.price) && (
                <span className="text-lg text-muted-foreground line-through">${book.originalPrice}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {canBuy && (
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => {
                    if (!isAuthenticated) { toast.error("Please sign in to add to cart"); return; }
                    addToCart.mutate({ bookId: book.id });
                  }}
                  disabled={addToCart.isPending}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              )}
              {canBorrow && (
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    if (!isAuthenticated) { toast.error("Please sign in to borrow"); return; }
                    handleBorrow();
                  }}
                >
                  <Library className="h-5 w-5" />
                  Borrow This Book
                </Button>
              )}
            </div>

            <Separator />

            {/* Details Table */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {book.isbn && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">ISBN:</span>
                  <span className="font-medium">{book.isbn}</span>
                </div>
              )}
              {book.publisherName && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Publisher:</span>
                  <span className="font-medium">{book.publisherName}</span>
                </div>
              )}
              {book.publishYear && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Year:</span>
                  <span className="font-medium">{book.publishYear}</span>
                </div>
              )}
              {book.pageCount && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Pages:</span>
                  <span className="font-medium">{book.pageCount}</span>
                </div>
              )}
              {book.language && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Language:</span>
                  <span className="font-medium">{book.language}</span>
                </div>
              )}
              {book.seller && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Seller:</span>
                  <span className="font-medium">{book.seller.name}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {book.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{book.description}</p>
              </div>
            )}

            <Separator />

            {/* Reviews Section */}
            <div>
              <h3 className="text-xl font-semibold font-[Playfair_Display] mb-4">
                Reviews {reviews && reviews.length > 0 && `(${reviews.length})`}
              </h3>

              {/* Write Review */}
              {isAuthenticated && (
                <Card className="mb-6">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-medium">Write a Review</p>
                    <StarRating rating={reviewRating} onRate={setReviewRating} interactive />
                    <Textarea
                      placeholder="Share your thoughts about this book..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                    />
                    <Button size="sm" onClick={handleSubmitReview} disabled={createReview.isPending}>
                      Submit Review
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Reviews List */}
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.user?.name || "Anonymous"}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="ml-auto">
                            <StarRating rating={review.rating} />
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this book!</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
