import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import { Banknote, CreditCard, Wallet, Loader2, CheckCircle, ShoppingCart, Package, MapPin, Phone, Truck, ShieldCheck, Clock } from "lucide-react";
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

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shipping, setShipping] = useState({ fullName: "", address: "", city: "", zip: "", country: "", phone: "" });
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
  const codFee = paymentMethod === "cod" ? 2.00 : 0;
  const total = subtotal + codFee;

  const handlePlaceOrder = () => {
    if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.zip || !shipping.country || !shipping.phone) {
      toast.error("Please fill in all shipping details including your phone number");
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    createOrder.mutate({
      paymentMethod,
      shippingAddress: `${shipping.fullName}\n${shipping.address}\n${shipping.city}, ${shipping.zip}\n${shipping.country}\nPhone: ${shipping.phone}`,
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
        <div className="container py-16 text-center flex-1 max-w-lg mx-auto">
          <div className="bg-green-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-14 w-14 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold font-[Playfair_Display] mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">Your order <span className="font-semibold text-foreground">#{orderId}</span> has been placed successfully.</p>

          {paymentMethod === "cod" && (
            <Card className="my-6 text-left">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg">
                  <Banknote className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">Cash on Delivery — Please prepare the exact amount when the delivery arrives.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4 shrink-0" />
                  <span>Estimated delivery: 3–7 business days</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>Our delivery partner will contact you before arrival</span>
                </div>
                <div className="text-sm font-semibold pt-2 border-t">
                  Total to pay on delivery: <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

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
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label>Street Address</Label>
                    <Input value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} placeholder="123 Main St, Apt 4" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} placeholder="City" />
                    </div>
                    <div>
                      <Label>ZIP Code</Label>
                      <Input value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} placeholder="12345" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <Label>Country</Label>
                      <Input value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} placeholder="Country" />
                    </div>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} placeholder="+1 (555) 000-0000" type="tel" />
                    <p className="text-xs text-muted-foreground mt-1">Required for delivery coordination</p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-primary" /> Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    {/* Cash on Delivery - Primary */}
                    <div className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                      <RadioGroupItem value="cod" id="cod" />
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Banknote className="h-5 w-5 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="cod" className="cursor-pointer font-semibold flex items-center gap-2">
                          Cash on Delivery
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Recommended</Badge>
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Pay when you receive your books at your doorstep</p>
                      </div>
                      <span className="text-xs text-muted-foreground">+$2.00 fee</span>
                    </div>

                    {/* Credit Card */}
                    <div className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "credit_card" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <CreditCard className="h-5 w-5 text-blue-700" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="credit_card" className="cursor-pointer font-semibold">Credit / Debit Card</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Pay securely with your card</p>
                      </div>
                    </div>

                    {/* Digital Wallet */}
                    <div className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "digital_wallet" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                      <RadioGroupItem value="digital_wallet" id="digital_wallet" />
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                        <Wallet className="h-5 w-5 text-purple-700" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="digital_wallet" className="cursor-pointer font-semibold">Digital Wallet</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Apple Pay, Google Pay, or PayPal</p>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* COD Info Box */}
                  {paymentMethod === "cod" && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
                        <ShieldCheck className="h-4 w-4" />
                        How Cash on Delivery Works
                      </div>
                      <ul className="text-xs text-amber-700 space-y-1.5 ml-6 list-disc">
                        <li>Your order will be shipped to your address</li>
                        <li>Our delivery partner will contact you before arrival</li>
                        <li>Pay the total amount in cash when you receive the package</li>
                        <li>Inspect your books before paying</li>
                      </ul>
                      <div className="flex items-center gap-2 text-xs text-amber-600 pt-1">
                        <Clock className="h-3.5 w-3.5" />
                        Estimated delivery: 3–7 business days
                      </div>
                    </div>
                  )}

                  {/* Credit Card Form */}
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
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Your payment information is encrypted and secure
                      </p>
                    </div>
                  )}

                  {/* Digital Wallet */}
                  {paymentMethod === "digital_wallet" && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">You will be redirected to complete payment after placing your order.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" /> Order Summary
                  </h3>
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
                    {paymentMethod === "cod" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">COD Fee</span>
                        <span>$2.00</span>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                  {paymentMethod === "cod" && (
                    <p className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded">
                      Pay <strong>${total.toFixed(2)}</strong> in cash upon delivery
                    </p>
                  )}
                  <Button className="w-full gap-2" size="lg" onClick={handlePlaceOrder} disabled={createOrder.isPending}>
                    {createOrder.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : paymentMethod === "cod" ? (
                      <Banknote className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    {paymentMethod === "cod" ? "Place Order — Pay on Delivery" : "Place Order"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    By placing your order, you agree to our Terms of Service
                  </p>
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
