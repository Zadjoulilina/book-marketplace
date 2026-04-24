import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { BookOpen, Loader2, Search, Users } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export default function AuthorsList() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: authors, isLoading } = trpc.authors.list.useQuery();

  const filteredAuthors = authors?.filter((author: any) =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.biography?.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container flex-1">
        <Breadcrumb items={[{ label: "Authors" }]} />

        <div className="py-8">
          <div className="flex items-center gap-3 mb-8">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-[Playfair_Display]">Discover Authors</h1>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search authors by name or biography..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Authors Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAuthors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No authors found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAuthors.map((author: any) => (
                <Card key={author.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{author.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {author.biography && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{author.biography}</p>
                    )}
                    {author.country && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold">Country:</span> {author.country}
                      </p>
                    )}
                    {author.birthYear && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold">Born:</span> {author.birthYear}
                      </p>
                    )}
                    <Link href={`/author/${author.id}`}>
                      <Button variant="outline" className="w-full gap-2">
                        <BookOpen className="h-4 w-4" />
                        View Works
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
