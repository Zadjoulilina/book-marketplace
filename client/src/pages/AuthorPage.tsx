import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoute, Link } from "wouter";
import { BookOpen, User, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export default function AuthorPage() {
  const [, params] = useRoute("/author/:id");
  const authorId = Number(params?.id);

  const { data: author, isLoading } = trpc.authors.getById.useQuery({ id: authorId }, { enabled: !!authorId });
  const books = author?.books;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-8 flex-1">
          <Skeleton className="h-48 mb-6" />
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-16 text-center flex-1">
          <User className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Author Not Found</h2>
          <Link href="/marketplace"><Button>Browse Books</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container flex-1">
        <Breadcrumb items={[{ label: "Authors", href: "/marketplace" }, { label: author.name }]} />

        {/* Author Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {author.photoUrl ? (
                  <img src={author.photoUrl} alt={author.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold font-[Playfair_Display] mb-2">{author.name}</h1>
                {author.bio && (
                  <p className="text-muted-foreground leading-relaxed mb-4">{author.bio}</p>
                )}
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" /> {books?.length ?? 0} book(s)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Author's Books */}
        <h2 className="text-xl font-bold font-[Playfair_Display] mb-4">Books by {author.name}</h2>
        {books && books.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
            {books.map((book: any) => (
              <Link key={book.id} href={`/book/${book.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="aspect-[3/4] bg-muted">
                    {book.coverImageUrl ? (
                      <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <BookOpen className="h-12 w-12 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary">${book.price}</span>
                      <Badge variant="outline" className="text-xs capitalize">{book.condition?.replace("_", " ")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No books found for this author.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
