import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SellBook = lazy(() => import("./pages/SellBook"));
const EditBook = lazy(() => import("./pages/EditBook"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const BorrowBook = lazy(() => import("./pages/BorrowBook"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AuthorPage = lazy(() => import("./pages/AuthorPage"));
const PublisherPage = lazy(() => import("./pages/PublisherPage"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/book/:id" component={BookDetail} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/sell" component={SellBook} />
        <Route path="/edit-book/:id" component={EditBook} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/borrow/:id" component={BorrowBook} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/author/:id" component={AuthorPage} />
        <Route path="/publisher/:id" component={PublisherPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
