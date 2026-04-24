import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoute, useLocation, Link } from "wouter";
import { BookOpen, Calendar, CheckCircle, Loader2, Library } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export default function BorrowBook() {
  const [, params] = useRoute("/borrow/:id");
  const bookId = Number(params?.id);
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: book, isLoading } = trpc.books.getById.useQuery({ id: bookId }, { enabled: !!bookId });

  // Default due date: 14 days from now
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 14);
  const [dueDate, setDueDate] = useState(defaultDue.toISOString().split("T")[0]);
  const [success, setSuccess] = useState(false);
  const [borrowingId, setBorrowingId] = useState<number | null>(null);

  const createBorrowing = trpc.borrowings.create.useMutation({
    onSuccess: (data) => {
      setSuccess(true);
      setBorrowingId(data.borrowingId);
    },
    onError: (err) => toast.error(err.message),
  });

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-16 text-center flex-1">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold font-[Playfair_Display] mb-3">Book Borrowed!</h1>
          <p className="text-muted-foreground mb-2">You have successfully borrowed "{book?.title}".</p>
          <p className="text-sm text-muted-foreground mb-8">Due date: {new Date(dueDate).toLocaleDateString()}</p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard"><Button variant="outline">View Dashboard</Button></Link>
            <Link href="/marketplace"><Button>Browse More</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col"><Navbar /><div className="container py-8 flex-1"><Skeleton className="h-64" /></div><Footer /></div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-16 text-center flex-1">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Book Not Found</h2>
          <Link href="/marketplace"><Button>Browse Marketplace</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container flex-1">
        <Breadcrumb items={[
          { label: "Marketplace", href: "/marketplace" },
          { label: book.title, href: `/book/${book.id}` },
          { label: "Borrow" },
        ]} />

        <div className="max-w-xl mx-auto pb-12">
          <h1 className="text-2xl font-bold font-[Playfair_Display] mb-6">Borrow Book</h1>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="h-24 w-18 rounded bg-muted overflow-hidden shrink-0">
                  {book.coverImageUrl ? (
                    <img src={book.coverImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.authorName || "Unknown Author"}</p>
                  <p className="text-sm text-muted-foreground mt-1">Condition: <span className="capitalize">{book.condition?.replace("_", " ")}</span></p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" /> Return Due Date
                  </Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Standard borrowing period is 14 days. Maximum 30 days.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                  <h4 className="font-medium">Borrowing Terms</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Return the book by the due date to avoid penalties</li>
                    <li>Keep the book in good condition</li>
                    <li>You will receive a reminder 3 days before the due date</li>
                    <li>Late returns may result in borrowing restrictions</li>
                  </ul>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => createBorrowing.mutate({ bookId: book.id, dueDate })}
                  disabled={createBorrowing.isPending}
                >
                  {createBorrowing.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Library className="h-4 w-4" />}
                  Confirm Borrowing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
