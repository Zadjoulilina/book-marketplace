import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Breadcrumb from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit2, Trash2, Plus, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { skipToken } from "@tanstack/react-query";

interface Book {
  id: number;
  title: string;
  authorName: string;
  coverImageUrl: string | null;
  price: string;
  category: string;
  condition: string;
  listingType: string;
  status: string;
  description: string | null;
}

interface BooksResponse {
  books: Book[];
  stats: {
    total: number;
    available: number;
    sold: number;
    borrowed: number;
  };
}

export default function DashboardBooks() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [redirecting, setRedirecting] = useState(false);

  // Handle authentication redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setRedirecting(true);
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Show loading state while checking auth
  if (authLoading || redirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect is in progress)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Fetch user's books (only after auth is confirmed)
  const { data: booksData, isLoading, refetch } = trpc.books.getUserBooks.useQuery(
    isAuthenticated && user ? undefined : skipToken
  );

  // Delete book mutation
  const deleteBookMutation = trpc.books.delete.useMutation({
    onSuccess: () => {
      toast.success("Book deleted successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete book");
    },
  });

  // Update book status mutation
  const updateStatusMutation = trpc.books.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Book status updated");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const booksResponse = booksData as BooksResponse | undefined;
  const books = booksResponse?.books ?? [];
  const stats = booksResponse?.stats ?? { total: 0, available: 0, sold: 0, borrowed: 0 };

  const handleDelete = (bookId: number) => {
    deleteBookMutation.mutate({ id: bookId });
  };

  const handleToggleStatus = (bookId: number, currentStatus: string) => {
    const newStatus = currentStatus === "available" ? "unavailable" : "available";
    updateStatusMutation.mutate({ id: bookId, status: newStatus as any });
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Books", href: "/dashboard/books" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Breadcrumb items={breadcrumbs} />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Books</h1>
              <p className="text-muted-foreground mt-2">Manage your book listings and sales</p>
            </div>
            <Button onClick={() => navigate("/sell")} className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Book
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">Total Books</div>
                <div className="text-2xl font-bold mt-2">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">Available</div>
                <div className="text-2xl font-bold text-green-600 mt-2">{stats.available}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">Sold</div>
                <div className="text-2xl font-bold text-blue-600 mt-2">{stats.sold}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">Borrowed</div>
                <div className="text-2xl font-bold text-purple-600 mt-2">{stats.borrowed}</div>
              </CardContent>
            </Card>
          </div>

          {/* Books List */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your books...</p>
            </div>
          ) : books.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't listed any books yet.</p>
                <Button onClick={() => navigate("/sell")}>List Your First Book</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {books.map((book: Book) => (
                <Card key={book.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      {/* Book Cover */}
                      <div className="flex-shrink-0 w-20 h-28 bg-muted rounded overflow-hidden">
                        {book.coverImageUrl ? (
                          <img
                            src={book.coverImageUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">{book.authorName}</p>
                          </div>
                          <Badge
                            variant={book.status === "available" ? "default" : "secondary"}
                          >
                            {book.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-muted-foreground">Category:</span>
                            <p className="font-medium">{book.category}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price:</span>
                            <p className="font-medium">${parseFloat(book.price).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Condition:</span>
                            <p className="font-medium capitalize">{book.condition.replace("_", " ")}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <p className="font-medium capitalize">{book.listingType}</p>
                          </div>
                        </div>

                        {book.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {book.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/book/${book.id}`)}
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/edit-book/${book.id}`)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleStatus(book.id, book.status)
                          }
                          title={book.status === "available" ? "Mark Unavailable" : "Mark Available"}
                        >
                          {book.status === "available" ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Book</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{book.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex gap-2 justify-end">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(book.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
