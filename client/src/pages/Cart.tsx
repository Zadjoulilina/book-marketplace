import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Trash2, Plus, Minus, BookOpen, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { getLoginUrl } from "@/const";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: cartItems, isLoading } = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });

  const updateQuantity = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const removeItem = trpc.cart.remove.useMutation({
    onSuccess: () => { toast.success("Item removed"); utils.cart.get.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const clearCart = trpc.cart.clear.useMutation({
    onSuccess: () => { toast.success("Cart cleared"); utils.cart.get.invalidate(); },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-16 text-center flex-1">
          <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to view your cart.</p>
          <a href={getLoginUrl()}><Button>Sign In</Button></a>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = cartItems?.reduce((sum: number, item: any) => sum + parseFloat(item.book?.price || "0") * item.quantity, 0) ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container flex-1">
        <Breadcrumb items={[{ label: "Cart" }]} />

        <h1 className="text-2xl font-bold font-[Playfair_Display] mb-6">Shopping Cart</h1>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading...</div>
        ) : !cartItems || cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">Browse our marketplace to find books you love.</p>
            <Link href="/marketplace"><Button>Browse Books</Button></Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 pb-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{cartItems.length} item(s)</p>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => clearCart.mutate()}>
                  Clear Cart
                </Button>
              </div>
              {cartItems.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex gap-4">
                    <div className="h-24 w-18 rounded bg-muted overflow-hidden shrink-0">
                      {item.book?.coverImageUrl ? (
                        <img src={item.book.coverImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/book/${item.bookId}`}>
                        <h3 className="font-semibold text-sm hover:text-primary transition-colors">{item.book?.title || "Unknown"}</h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">{item.book?.authorName || "Unknown Author"}</p>
                      <p className="font-bold text-primary mt-2">${item.book?.price}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem.mutate({ id: item.id })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity - 1 })} disabled={item.quantity <= 1}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity + 1 })}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Order Summary</h3>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full gap-2" size="lg">
                      Proceed to Checkout <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
