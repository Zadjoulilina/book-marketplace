import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  Search,
  ShoppingBag,
  Library,
  Users,
  ArrowRight,
  Star,
  BookMarked,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CATEGORIES = [
  { name: "Fiction", icon: "📖", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { name: "Non-Fiction", icon: "📚", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { name: "Science", icon: "🔬", color: "bg-green-50 text-green-700 border-green-200" },
  { name: "Technology", icon: "💻", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { name: "History", icon: "🏛️", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { name: "Philosophy", icon: "🧠", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { name: "Art", icon: "🎨", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { name: "Business", icon: "📊", color: "bg-teal-50 text-teal-700 border-teal-200" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: featuredBooks, isLoading: loadingBooks } = trpc.books.featured.useQuery({ limit: 8 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-[Playfair_Display] tracking-tight mb-6">
              Discover, Buy & Borrow{" "}
              <span className="text-primary">Books</span> You Love
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Join our community of readers. Find rare gems, sell your collection, or borrow from our digital library — all in one place.
            </p>
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, author, or ISBN..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6">
                Search
              </Button>
            </form>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/marketplace">
                <Button variant="outline" className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Browse Marketplace
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link href="/sell">
                  <Button variant="outline" className="gap-2">
                    <BookMarked className="h-4 w-4" />
                    Sell a Book
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Join Now
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: BookOpen, label: "Books Listed", value: "1,000+" },
              { icon: Users, label: "Active Readers", value: "500+" },
              { icon: Library, label: "Books Borrowed", value: "2,500+" },
              { icon: TrendingUp, label: "Transactions", value: "5,000+" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <stat.icon className="h-6 w-6 text-primary" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-[Playfair_Display]">Browse by Category</h2>
            <p className="text-muted-foreground mt-1">Find books in your favorite genre</p>
          </div>
          <Link href="/marketplace">
            <Button variant="ghost" className="gap-1 hidden sm:flex">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/marketplace?category=${encodeURIComponent(cat.name)}`}>
              <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border">
                <CardContent className="p-4 text-center">
                  <span className="text-2xl block mb-2">{cat.icon}</span>
                  <span className="text-xs font-medium">{cat.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Books */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-[Playfair_Display]">Recently Listed</h2>
              <p className="text-muted-foreground mt-1">Fresh additions to our marketplace</p>
            </div>
            <Link href="/marketplace">
              <Button variant="ghost" className="gap-1 hidden sm:flex">
                See More <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loadingBooks
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-5 w-1/3" />
                    </CardContent>
                  </Card>
                ))
              : featuredBooks?.map((book) => (
                  <Link key={book.id} href={`/book/${book.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                      <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                        {book.coverImageUrl ? (
                          <img
                            src={book.coverImageUrl}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <BookOpen className="h-12 w-12 text-primary/30" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge variant={book.listingType === "lend" ? "secondary" : "default"} className="text-xs">
                            {book.listingType === "lend" ? "Borrow" : book.listingType === "both" ? "Buy/Borrow" : "Buy"}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{book.authorName || "Unknown Author"}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-primary">${book.price}</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {book.condition?.replace("_", " ")}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
          {featuredBooks?.length === 0 && !loadingBooks && (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No books listed yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to list a book on our marketplace!</p>
              <Link href="/sell">
                <Button>List a Book</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold font-[Playfair_Display]">How It Works</h2>
          <p className="text-muted-foreground mt-2">Three simple steps to get started</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Create an Account",
              description: "Sign up for free and set up your profile to start buying, selling, or borrowing books.",
              icon: Users,
            },
            {
              step: "02",
              title: "Browse or List",
              description: "Search our marketplace for books you want, or list your own books for sale or lending.",
              icon: Search,
            },
            {
              step: "03",
              title: "Buy, Sell or Borrow",
              description: "Complete your purchase securely, or borrow books from our library with easy returns.",
              icon: ShoppingBag,
            },
          ].map((item) => (
            <div key={item.step} className="text-center p-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary block mb-2">STEP {item.step}</span>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-[Playfair_Display] mb-4">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of book lovers who buy, sell, and borrow books every day on BookHub.
          </p>
          {isAuthenticated ? (
            <div className="flex gap-3 justify-center">
              <Link href="/marketplace">
                <Button variant="secondary" size="lg">
                  Browse Books
                </Button>
              </Link>
              <Link href="/sell">
                <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Sell a Book
                </Button>
              </Link>
            </div>
          ) : (
            <a href={getLoginUrl()}>
              <Button variant="secondary" size="lg">
                Get Started Free
              </Button>
            </a>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
