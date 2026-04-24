import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  LogIn,
  UserPlus,
  ShoppingBag,
  Library,
  Star,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FEATURES = [
  { icon: ShoppingBag, title: "Buy & Sell Books", description: "List your books for sale or find great deals from other readers." },
  { icon: Library, title: "Borrow Books", description: "Access our lending library and borrow books with easy returns." },
  { icon: Star, title: "Rate & Review", description: "Share your thoughts and discover books loved by the community." },
  { icon: Shield, title: "Secure Transactions", description: "All purchases are protected with our secure payment system." },
];

const BENEFITS_BUYER = [
  "Browse thousands of books",
  "Filter by category, condition & price",
  "Secure checkout with COD option",
  "Track your order history",
  "Borrow books from our library",
];

const BENEFITS_SELLER = [
  "List books in minutes",
  "Upload cover images",
  "Manage your listings easily",
  "Reach thousands of readers",
  "Dashboard to track sales",
];

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/20 py-16">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Auth Card */}
              <div className="max-w-md mx-auto lg:mx-0 w-full">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold font-[Playfair_Display]">BookHub</span>
                </div>

                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin" className="gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  {/* Sign In Tab */}
                  <TabsContent value="signin">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl font-[Playfair_Display]">Welcome Back</CardTitle>
                        <CardDescription>
                          Sign in to your BookHub account to continue your reading journey.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <a href={loginUrl} className="block">
                          <Button size="lg" className="w-full gap-2">
                            <LogIn className="h-5 w-5" />
                            Sign In with Manus
                          </Button>
                        </a>
                        <p className="text-xs text-center text-muted-foreground">
                          By signing in, you agree to our{" "}
                          <span className="underline cursor-pointer">Terms of Service</span> and{" "}
                          <span className="underline cursor-pointer">Privacy Policy</span>.
                        </p>
                        <div className="border-t pt-4">
                          <p className="text-sm text-center text-muted-foreground">
                            Don't have an account?{" "}
                            <a href={loginUrl} className="text-primary font-medium hover:underline">
                              Create one for free
                            </a>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Sign Up Tab */}
                  <TabsContent value="signup">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl font-[Playfair_Display]">Create Account</CardTitle>
                        <CardDescription>
                          Join thousands of book lovers on BookHub. It's free to get started!
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">What you get for free:</p>
                          <ul className="space-y-2">
                            {[
                              "Buy, sell & borrow books",
                              "Personal reading dashboard",
                              "Rate & review books",
                              "Borrowing history tracking",
                              "Notifications & alerts",
                            ].map((item) => (
                              <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <a href={loginUrl} className="block">
                          <Button size="lg" className="w-full gap-2">
                            <UserPlus className="h-5 w-5" />
                            Create Free Account
                          </Button>
                        </a>
                        <p className="text-xs text-center text-muted-foreground">
                          Already have an account?{" "}
                          <a href={loginUrl} className="text-primary font-medium hover:underline">
                            Sign in here
                          </a>
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right: Features */}
              <div className="hidden lg:block">
                <Badge className="mb-4">Trusted by 500+ Readers</Badge>
                <h1 className="text-4xl font-bold font-[Playfair_Display] mb-4">
                  Your Gateway to a World of Books
                </h1>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  BookHub connects book lovers to buy, sell, and borrow books. Discover new titles, share your collection, and join a vibrant reading community.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {FEATURES.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.title} className="flex gap-3 p-4 rounded-lg bg-card border">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{feature.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-[Playfair_Display] mb-3">
              Everything You Need in One Place
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Whether you're a buyer, seller, or library member — BookHub has you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Buyers */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">For Buyers & Borrowers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {BENEFITS_BUYER.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Sellers */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">For Sellers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {BENEFITS_SELLER.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-10">
            <a href={loginUrl}>
              <Button size="lg" className="gap-2">
                Get Started for Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <p className="text-sm text-muted-foreground mt-3">
              Or{" "}
              <Link href="/marketplace" className="text-primary hover:underline">
                browse the marketplace
              </Link>{" "}
              without signing in
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
