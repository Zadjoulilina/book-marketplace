import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, BookOpen, Package, Library, DollarSign, Shield, Ban,
  Trash2, RotateCcw, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-16 text-center flex-1">
          <Shield className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container flex-1">
        <Breadcrumb items={[{ label: "Admin Panel" }]} />
        <h1 className="text-2xl font-bold font-[Playfair_Display] mb-6">Admin Panel</h1>

        <StatsSection />

        <Tabs defaultValue="users" className="mt-8 mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="gap-1"><Users className="h-4 w-4" /> Users</TabsTrigger>
            <TabsTrigger value="books" className="gap-1"><BookOpen className="h-4 w-4" /> Books</TabsTrigger>
            <TabsTrigger value="orders" className="gap-1"><Package className="h-4 w-4" /> Orders</TabsTrigger>
            <TabsTrigger value="borrowings" className="gap-1"><Library className="h-4 w-4" /> Borrowings</TabsTrigger>
          </TabsList>

          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="books"><BooksTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="borrowings"><BorrowingsTab /></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

function StatsSection() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();
  if (isLoading) return <div className="grid grid-cols-2 md:grid-cols-5 gap-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
  const items = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-600 bg-blue-500/10" },
    { label: "Total Books", value: stats?.totalBooks ?? 0, icon: BookOpen, color: "text-green-600 bg-green-500/10" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: Package, color: "text-purple-600 bg-purple-500/10" },
    { label: "Borrowings", value: stats?.totalBorrowings ?? 0, icon: Library, color: "text-orange-600 bg-orange-500/10" },
    { label: "Revenue", value: `$${Number(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: DollarSign, color: "text-primary bg-primary/10" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UsersTab() {
  const [page, setPage] = useState(1);
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.users.useQuery({ page, limit: 20 });
  const toggleBan = trpc.admin.toggleBan.useMutation({
    onSuccess: () => { toast.success("User updated"); utils.admin.users.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Joined</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="p-3"><Skeleton className="h-8" /></td></tr>
                ))
              ) : data?.users.map((u: any) => (
                <tr key={u.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">{u.id}</td>
                  <td className="p-3 font-medium">{u.name || "—"}</td>
                  <td className="p-3 text-muted-foreground">{u.email || "—"}</td>
                  <td className="p-3"><Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge></td>
                  <td className="p-3"><Badge variant={u.isBanned ? "destructive" : "outline"}>{u.isBanned ? "Banned" : "Active"}</Badge></td>
                  <td className="p-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" onClick={() => toggleBan.mutate({ userId: u.id, isBanned: !u.isBanned })}>
                      <Ban className="h-4 w-4 mr-1" /> {u.isBanned ? "Unban" : "Ban"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BooksTab() {
  const [page, setPage] = useState(1);
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.allBooks.useQuery({ page, limit: 20 });
  const deleteBook = trpc.admin.deleteBook.useMutation({
    onSuccess: () => { toast.success("Book deleted"); utils.admin.allBooks.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">Title</th>
                <th className="text-left p-3 font-medium">Author</th>
                <th className="text-left p-3 font-medium">Price</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="p-3"><Skeleton className="h-8" /></td></tr>
                ))
              ) : data?.books.map((b: any) => (
                <tr key={b.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">{b.id}</td>
                  <td className="p-3 font-medium max-w-[200px] truncate">{b.title}</td>
                  <td className="p-3 text-muted-foreground">{b.authorName || "—"}</td>
                  <td className="p-3">${b.price}</td>
                  <td className="p-3"><Badge variant="outline" className="capitalize">{b.status}</Badge></td>
                  <td className="p-3 capitalize">{b.listingType}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm("Delete this book?")) deleteBook.mutate({ id: b.id }); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OrdersTab() {
  const [page, setPage] = useState(1);
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.allOrders.useQuery({ page, limit: 20 });
  const updateStatus = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => { toast.success("Order updated"); utils.admin.allOrders.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">Buyer</th>
                <th className="text-left p-3 font-medium">Total</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Payment</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="p-3"><Skeleton className="h-8" /></td></tr>
                ))
              ) : data?.orders.map((o: any) => (
                <tr key={o.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">#{o.id}</td>
                  <td className="p-3">User #{o.buyerId}</td>
                  <td className="p-3 font-medium">${o.totalAmount}</td>
                  <td className="p-3"><Badge variant="outline" className="capitalize">{o.status}</Badge></td>
                  <td className="p-3 capitalize text-muted-foreground">{o.paymentMethod?.replace("_", " ")}</td>
                  <td className="p-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Select value={o.status} onValueChange={(v) => updateStatus.mutate({ orderId: o.id, status: v })}>
                      <SelectTrigger className="h-8 w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BorrowingsTab() {
  const [page, setPage] = useState(1);
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.allBorrowings.useQuery({ page, limit: 20 });
  const returnBook = trpc.admin.returnBorrowing.useMutation({
    onSuccess: () => { toast.success("Book returned"); utils.admin.allBorrowings.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">User</th>
                <th className="text-left p-3 font-medium">Book</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Borrow Date</th>
                <th className="text-left p-3 font-medium">Due Date</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="p-3"><Skeleton className="h-8" /></td></tr>
                ))
              ) : data?.borrowings.map((b: any) => {
                const isOverdue = b.status === "active" && new Date(b.dueDate) < new Date();
                return (
                  <tr key={b.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">{b.id}</td>
                    <td className="p-3">User #{b.userId}</td>
                    <td className="p-3">Book #{b.bookId}</td>
                    <td className="p-3">
                      <Badge variant={isOverdue ? "destructive" : b.status === "returned" ? "secondary" : "outline"} className="capitalize">
                        {isOverdue ? "Overdue" : b.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(b.borrowDate).toLocaleDateString()}</td>
                    <td className="p-3 text-muted-foreground">{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td className="p-3">
                      {b.status === "active" && (
                        <Button variant="ghost" size="sm" onClick={() => returnBook.mutate({ id: b.id })}>
                          <RotateCcw className="h-4 w-4 mr-1" /> Return
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
