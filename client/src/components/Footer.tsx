import { Link } from "wouter";
import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold font-[Playfair_Display]">BookHub</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted marketplace for buying, selling, and borrowing books. Join our community of book lovers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
              <li><Link href="/authors" className="hover:text-primary transition-colors">Authors</Link></li>
              <li><Link href="/marketplace?listingType=lend" className="hover:text-primary transition-colors">Borrow Books</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/sell" className="hover:text-primary transition-colors">Sell a Book</Link></li>
              <li><Link href="/dashboard/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/marketplace?category=Fiction" className="hover:text-primary transition-colors">Fiction</Link></li>
              <li><Link href="/marketplace?category=Non-Fiction" className="hover:text-primary transition-colors">Non-Fiction</Link></li>
              <li><Link href="/marketplace?category=Science" className="hover:text-primary transition-colors">Science</Link></li>
              <li><Link href="/marketplace?category=Technology" className="hover:text-primary transition-colors">Technology</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BookHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
