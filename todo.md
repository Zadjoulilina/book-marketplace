# BookHub - Project TODO

## Phase 1: Database & Backend Foundation
- [x] Design and implement database schema (users, books, orders, order_items, borrowings, reviews, authors, cart_items, notifications)
- [x] Run database migrations
- [x] Create db helper functions for all tables

## Phase 2: Backend API (tRPC Routers)
- [x] Books CRUD router (create, read, update, delete, list with pagination)
- [x] Server-side search (by title, author, username) and filtering (category, condition, seller type, price range)
- [x] Orders router (create order, list orders, order details)
- [x] Cart router (add, remove, update quantity, get cart)
- [x] Borrowings router (borrow, return, list borrowings, check availability)
- [x] Reviews router (create, list by book, average rating)
- [x] Authors/Publishers router (list, detail, books by author)
- [x] Admin router (manage users, manage books, system stats, manage borrowings)
- [x] Notifications router (list, mark read, create for due dates)
- [x] File upload endpoint for book cover images via S3 storage

## Phase 3: Frontend - Layout & Home
- [x] Design color palette and typography (warm bookstore theme)
- [x] Global layout with responsive navbar and footer
- [x] Hero section with search bar and featured categories
- [x] Featured books section on home page showing latest books from DB
- [x] Statistics section (total books, active users, etc.)
- [x] Breadcrumb component for all internal pages

## Phase 4: Marketplace & Book Details
- [x] Marketplace page with server-side search and filters
- [x] Dynamic filtering UI (category, condition, price range, seller type)
- [x] Pagination component
- [x] Book detail page with full info (cover, title, author, ISBN, publisher, year, pages, condition, price)
- [x] Availability status display (available, sold, borrowed, unavailable)
- [x] Buy and Borrow action buttons

## Phase 5: Auth & User Dashboard
- [x] User profile page with edit capability
- [x] Personal dashboard with activity summary
- [x] My Listed Books section (seller view with edit/delete)
- [x] Sell/List a Book form with image upload
- [x] Edit Book form
- [x] Orders section in dashboard
- [x] Active Borrowings section in dashboard
- [x] Auth-gated pages with sign-in prompts

## Phase 6: Cart, Checkout & Borrowing
- [x] Shopping cart page with quantity management
- [x] Checkout flow with multiple payment methods UI (credit card, digital wallet, bank transfer)
- [x] Order confirmation state with order ID
- [x] Borrowing request flow with date selection
- [x] Borrowing confirmation with due date display

## Phase 7: Admin Panel & Advanced Features
- [x] Admin dashboard with statistics (sales, users, books, borrowings)
- [x] Admin user management (view, ban/unban users)
- [x] Admin book management (view, delete)
- [x] Admin order management (view, update status)
- [x] Admin borrowing management (view all, mark returns)
- [x] Reviews and ratings system on book detail page
- [x] Author pages (bio, works list)
- [x] Publisher pages (description, works list)
- [x] In-app notifications page
- [ ] Stripe integration for real payment processing

## Phase 8: Testing & Delivery
- [x] Write vitest tests for key backend procedures (18 tests passing)
- [ ] Final checkpoint and delivery
