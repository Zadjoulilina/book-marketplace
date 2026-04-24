import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import {
  BookMarked, Package, BookOpen, User, Edit, Save,
  Plus, Trash2, Eye, Clock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", bio: "", phone: "", address: "" });

  const { data: myBooks, isLoading: loadingBooks } = trpc.books.bySeller.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myOrders, isLoading: loadingOrders } = trpc.orders.myOrders.useQuery(undefined, { enabled: isAuthenticated });
  const { data: myBorrowings, isLoading: loadingBorrowings } = trpc.borrowings.myBorrowings.useQuery(undefined, { enabled: isAuthenticated });

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!");
      setEditing(false);
      utils.auth.me.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteBook = trpc.books.delete.useMutation({
    onSuccess: () => {
      toast.success("Book deleted!");
      utils.books.bySeller.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-8 flex-1">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-16 text-center flex-1">
          <User className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access your dashboard.</p>
          <a href={getLoginUrl()}><Button>Sign In</Button></a>
        </div>
        <Footer />
      </div>
    );
  }

  const startEditing = () => {
    setProfileData({
      name: user?.name || "",
      bio: (user as any)?.bio || "",
      phone: (user as any)?.phone || "",
      address: (user as any)?.address || "",
    });
    setEditing(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container flex-1">
        <Breadcrumb items={[{ label: "Dashboard" }]} />

        {/* Profile Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-[Playfair_Display]">
                {editing ? (
                  <Input value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="max-w-xs" />
                ) : (
                  user?.name || "User"
                )}
              </h1>
              <p className="text-muted-foreground">{user?.email}</p>
              {user?.role === "admin" && <Badge className="mt-1">Admin</Badge>}
            </div>
          </div>
          {editing ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateProfile.mutate(profileData)} disabled={updateProfile.isPending}>
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={startEditing}>
              <Edit className="h-4 w-4 mr-1" /> Edit Profile
            </Button>
          )}
        </div>

        {editing && (
          <Card className="mb-8">
            <CardContent className="p-6 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} placeholder="Your phone number" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Address</label>
                <Input value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} placeholder="Your address" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Bio</label>
                <Textarea value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} placeholder="Tell us about yourself..." rows={3} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookMarked className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myBooks?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">My Books</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myOrders?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myBorrowings?.filter((b: any) => b.status === "active").length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Active Borrowings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Books */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-[Playfair_Display]">My Listed Books</CardTitle>
            <Link href="/sell"><Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> List New</Button></Link>
          </CardHeader>
          <CardContent>
            {loadingBooks ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
            ) : myBooks && myBooks.length > 0 ? (
              <div className="space-y-3">
                {myBooks.slice(0, 5).map((book: any) => (
                  <div key={book.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="h-12 w-9 rounded bg-muted overflow-hidden shrink-0">
                      {book.coverImageUrl ? (
                        <img src={book.coverImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-4 w-4 text-muted-foreground" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground">${book.price} · <span className="capitalize">{book.status}</span></p>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/book/${book.id}`}><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button></Link>
                      <Link href={`/edit-book/${book.id}`}><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button></Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm("Delete this book?")) deleteBook.mutate({ id: book.id }); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">You haven't listed any books yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-[Playfair_Display]">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-16" />)}</div>
            ) : myOrders && myOrders.length > 0 ? (
              <div className="space-y-3">
                {myOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} · {order.items?.length ?? 0} item(s)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">${order.totalAmount}</span>
                      <Badge variant="outline" className="capitalize">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No orders yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Active Borrowings */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="font-[Playfair_Display]">Active Borrowings</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBorrowings ? (
              <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-16" />)}</div>
            ) : myBorrowings && myBorrowings.filter((b: any) => b.status === "active").length > 0 ? (
              <div className="space-y-3">
                {myBorrowings.filter((b: any) => b.status === "active").map((borrow: any) => {
                  const dueDate = new Date(borrow.dueDate);
                  const isOverdue = dueDate < new Date();
                  return (
                    <div key={borrow.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-8 rounded bg-muted overflow-hidden shrink-0">
                          {borrow.book?.coverImageUrl ? (
                            <img src={borrow.book.coverImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-3 w-3 text-muted-foreground" /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{borrow.book?.title || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {dueDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={isOverdue ? "destructive" : "outline"}>
                        {isOverdue ? "Overdue" : "Active"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No active borrowings.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
