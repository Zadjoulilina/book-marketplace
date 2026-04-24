import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Link, useLocation, useSearch } from "wouter";
import { BookOpen, Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const CATEGORIES = ["Fiction", "Non-Fiction", "Science", "Technology", "History", "Philosophy", "Art", "Business", "Education", "Biography", "Children", "Other"];

export default function Marketplace() {
  const searchString = useSearch();
  const [, navigate] = useLocation();
  const params = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [condition, setCondition] = useState(params.get("condition") || "");
  const [listingType, setListingType] = useState(params.get("listingType") || "");
  const [sortBy, setSortBy] = useState(params.get("sortBy") || "newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [page, setPage] = useState(Number(params.get("page")) || 1);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 12;

  const queryInput = useMemo(() => ({
    search: search || undefined,
    category: category || undefined,
    condition: condition || undefined,
    listingType: listingType || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 200 ? priceRange[1] : undefined,
    sortBy,
    page,
    limit,
  }), [search, category, condition, listingType, priceRange, sortBy, page]);

  const { data, isLoading } = trpc.books.list.useQuery(queryInput);

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setCondition("");
    setListingType("");
    setSortBy("newest");
    setPriceRange([0, 200]);
    setPage(1);
  };

  const hasActiveFilters = category || condition || listingType || priceRange[0] > 0 || priceRange[1] < 200;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container flex-1">
        <Breadcrumb items={[{ label: "Marketplace" }]} />

        <div className="flex flex-col lg:flex-row gap-6 pb-12">
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 shrink-0 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                  Clear All
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={category} onValueChange={(v) => { setCategory(v === "all" ? "" : v); setPage(1); }}>
                  <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Condition</label>
                <Select value={condition} onValueChange={(v) => { setCondition(v === "all" ? "" : v); setPage(1); }}>
                  <SelectTrigger><SelectValue placeholder="Any Condition" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Condition</SelectItem>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Listing Type</label>
                <Select value={listingType} onValueChange={(v) => { setListingType(v === "all" ? "" : v); setPage(1); }}>
                  <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sell">For Sale</SelectItem>
                    <SelectItem value="lend">For Borrowing</SelectItem>
                    <SelectItem value="both">Buy or Borrow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price Range: ${priceRange[0]} - ${priceRange[1] >= 200 ? "200+" : priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={(v) => { setPriceRange(v as [number, number]); setPage(1); }}
                  min={0}
                  max={200}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search books..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
                <Button type="submit" variant="outline" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </form>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {category && (
                  <Badge variant="secondary" className="gap-1">
                    {category} <X className="h-3 w-3 cursor-pointer" onClick={() => setCategory("")} />
                  </Badge>
                )}
                {condition && (
                  <Badge variant="secondary" className="gap-1">
                    {CONDITIONS.find(c => c.value === condition)?.label} <X className="h-3 w-3 cursor-pointer" onClick={() => setCondition("")} />
                  </Badge>
                )}
                {listingType && (
                  <Badge variant="secondary" className="gap-1">
                    {listingType === "sell" ? "For Sale" : listingType === "lend" ? "For Borrowing" : "Buy/Borrow"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setListingType("")} />
                  </Badge>
                )}
              </div>
            )}

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-4">
              {data ? `${data.total} book${data.total !== 1 ? "s" : ""} found` : "Loading..."}
            </p>

            {/* Book Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="aspect-[3/4] w-full" />
                      <CardContent className="p-3 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-5 w-1/3" />
                      </CardContent>
                    </Card>
                  ))
                : data?.books.map((book) => (
                    <Link key={book.id} href={`/book/${book.id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group h-full">
                        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                          {book.coverImageUrl ? (
                            <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                              <BookOpen className="h-10 w-10 text-primary/30" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge variant={book.listingType === "lend" ? "secondary" : "default"} className="text-xs">
                              {book.listingType === "lend" ? "Borrow" : book.listingType === "both" ? "Buy/Borrow" : "Buy"}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{book.authorName || "Unknown Author"}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-primary text-sm">${book.price}</span>
                            <Badge variant="outline" className="text-xs capitalize">{book.condition?.replace("_", " ")}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
            </div>

            {/* Empty State */}
            {data?.books.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No books found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) { pageNum = i + 1; }
                  else if (page <= 4) { pageNum = i + 1; }
                  else if (page >= totalPages - 3) { pageNum = totalPages - 6 + i; }
                  else { pageNum = page - 3 + i; }
                  return (
                    <Button key={pageNum} variant={page === pageNum ? "default" : "outline"} size="sm" onClick={() => setPage(pageNum)}>
                      {pageNum}
                    </Button>
                  );
                })}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
