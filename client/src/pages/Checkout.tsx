import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useLocation, Link } from "wouter";
import { CreditCard, Wallet, Building2, Loader2, CheckCircle, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: cartItems } = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });

  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [shipping, setShipping] = useState({ address: "", city: "", zip: "", country: "" });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      setOrderPlaced(true);
      setOrderId(data.orderId);
      utils.cart.get.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const subtotal = cartItems?.reduce((sum: number, item: any) => sum + parseFloat(item.book?.price || "0") * item.quantity, 0) ?? 0;

  const handlePlaceOrder = () => {
    if (!shipping.address || !shipping.city || !shipping.zip || !shipping.country) {
      toast.error("Please fill in all shipping details");
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    createOrder.mutate({
      paymentMethod,
      shippingAddress: shipping.address,
      shippingCity: shipping.city,
      shippingZip: shipping.zip,
      shippingCountry: shipping.country,
      items: cartItems.map((item: any) => ({
        bookId: item.bookId,
        quantity: item.quantity,
        priceAtPurchase: item.book?.price || "0",
      })),
    });
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-16 text-center flex-1">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold font-[Playfair_Display] mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">Your order #{orderId} has been placed successfully.</p>
          <p className="text-sm text-muted-foreground mb-8">You will receive a confirmation notification shortly.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard"><Button variant="outline">View Dashboard</Button></Link>
            <Link href="/marketplace"><Button>Continue Shopping</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container flex-1">
        <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />

        <h1 className="text-2xl font-bold font-[Playfair_Display] mb-6">Checkout</h1>

        {!cartItems || cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <Link href="/marketplace"><Button>Browse Books</Button></Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 pb-12">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping */}
              <Card>
                <CardHeader><CardTitle className="text-base">Shipping Address</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Street Address</Label>
                    <Input value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} placeholder="123 Main St" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} placeholder="City" />
                    </div>
                    <div>
                      <Label>ZIP Code</Label>
                      <Input value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} placeholder="12345" />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} placeholder="Country" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader><CardTitle className="text-base">Payment Method</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="credit_card" className="flex-1 cursor-pointer">Credit / Debit Card</Label>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="digital_wallet" id="digital_wallet" />
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="digital_wallet" className="flex-1 cursor-pointer">Digital Wallet</Label>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">Bank Transfer</Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "credit_card" && (
                    <div className="mt-4 space-y-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <Label>Card Number</Label>
                        <Input placeholder="4242 4242 4242 4242" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Expiry</Label><Input placeholder="MM/YY" /></div>
                        <div><Label>CVC</Label><Input placeholder="123" /></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Order Summary</h3>
                  <div className="space-y-3">
                    {cartItems.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[180px]">{item.book?.title} x{item.quantity}</span>
                        <span>${(parseFloat(item.book?.price || "0") * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
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
                  <Button className="w-full gap-2" size="lg" onClick={handlePlaceOrder} disabled={createOrder.isPending}>
                    {createOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    Place Order
                  </Button>
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
