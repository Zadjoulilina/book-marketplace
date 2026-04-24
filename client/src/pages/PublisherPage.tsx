import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoute, Link } from "wouter";
import { BookOpen, Building2, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export default function PublisherPage() {
  const [, params] = useRoute("/publisher/:id");
  const publisherId = Number(params?.id);

  const { data: publisher, isLoading } = trpc.publishers.getById.useQuery({ id: publisherId }, { enabled: !!publisherId });
  const books = publisher?.books;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-8 flex-1"><Skeleton className="h-48 mb-6" /></div>
        <Footer />
      </div>
    );
  }

  if (!publisher) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-16 text-center flex-1">
          <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Publisher Not Found</h2>
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
        <Breadcrumb items={[{ label: "Publishers", href: "/marketplace" }, { label: publisher.name }]} />

        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-[Playfair_Display] mb-2">{publisher.name}</h1>
                {publisher.description && <p className="text-muted-foreground mb-3">{publisher.description}</p>}
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {publisher.website && (
                    <a href={publisher.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <Globe className="h-4 w-4" /> Website
                    </a>
                  )}
                  <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {books?.length ?? 0} book(s)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold font-[Playfair_Display] mb-4">Books by {publisher.name}</h2>
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
                    <p className="text-xs text-muted-foreground mt-1">{book.authorName || "Unknown"}</p>
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
          <p className="text-muted-foreground text-center py-8">No books found for this publisher.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
