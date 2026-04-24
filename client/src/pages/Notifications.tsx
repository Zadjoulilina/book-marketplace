import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, BookOpen, ShoppingCart, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

const TYPE_ICONS: Record<string, any> = {
  borrow_reminder: AlertTriangle,
  overdue_notice: AlertTriangle,
  order_confirmation: ShoppingCart,
  return_confirmation: BookOpen,
  general: Info,
};

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: notifications, isLoading } = trpc.notifications.list.useQuery(undefined, { enabled: isAuthenticated });

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => { utils.notifications.list.invalidate(); utils.notifications.unreadCount.invalidate(); },
  });

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      toast.success("All notifications marked as read");
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container flex-1">
        <Breadcrumb items={[{ label: "Notifications" }]} />

        <div className="max-w-2xl mx-auto pb-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-[Playfair_Display]">Notifications</h1>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} className="gap-1">
                <CheckCheck className="h-4 w-4" /> Mark All Read
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Loading...</div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif: any) => {
                const Icon = TYPE_ICONS[notif.type] || Info;
                return (
                  <Card
                    key={notif.id}
                    className={`cursor-pointer transition-colors ${!notif.isRead ? "bg-primary/5 border-primary/20" : ""}`}
                    onClick={() => !notif.isRead && markRead.mutate({ id: notif.id })}
                  >
                    <CardContent className="p-4 flex gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                        notif.type === "overdue_notice" ? "bg-destructive/10" : "bg-primary/10"
                      }`}>
                        <Icon className={`h-5 w-5 ${notif.type === "overdue_notice" ? "text-destructive" : "text-primary"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{notif.title}</h4>
                          {!notif.isRead && <Badge className="h-5 text-xs">New</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
