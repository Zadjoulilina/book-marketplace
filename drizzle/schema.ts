import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  isBanned: boolean("isBanned").default(false).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Authors ─────────────────────────────────────────────────────────
export const authors = mysqlTable("authors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio"),
  photoUrl: text("photoUrl"),
  website: varchar("website", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Author = typeof authors.$inferSelect;
export type InsertAuthor = typeof authors.$inferInsert;

// ─── Publishers ──────────────────────────────────────────────────────
export const publishers = mysqlTable("publishers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logoUrl: text("logoUrl"),
  website: varchar("website", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Publisher = typeof publishers.$inferSelect;
export type InsertPublisher = typeof publishers.$inferInsert;

// ─── Books ───────────────────────────────────────────────────────────
export const books = mysqlTable("books", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  isbn: varchar("isbn", { length: 20 }),
  coverImageUrl: text("coverImageUrl"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }),
  condition: mysqlEnum("condition", ["new", "like_new", "good", "fair", "poor"]).default("good").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  language: varchar("language", { length: 50 }).default("English"),
  pageCount: int("pageCount"),
  publishYear: int("publishYear"),
  status: mysqlEnum("status", ["available", "sold", "borrowed", "unavailable"]).default("available").notNull(),
  listingType: mysqlEnum("listingType", ["sell", "lend", "both"]).default("sell").notNull(),
  sellerId: int("sellerId").notNull(),
  authorId: int("authorId"),
  authorName: varchar("authorName", { length: 255 }),
  publisherId: int("publisherId"),
  publisherName: varchar("publisherName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Book = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;

// ─── Cart Items ──────────────────────────────────────────────────────
export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bookId: int("bookId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// ─── Orders ──────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  buyerId: int("buyerId").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentIntentId: varchar("paymentIntentId", { length: 255 }),
  shippingAddress: text("shippingAddress"),
  shippingCity: varchar("shippingCity", { length: 100 }),
  shippingZip: varchar("shippingZip", { length: 20 }),
  shippingCountry: varchar("shippingCountry", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── Order Items ─────────────────────────────────────────────────────
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  bookId: int("bookId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  priceAtPurchase: decimal("priceAtPurchase", { precision: 10, scale: 2 }).notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ─── Borrowings ──────────────────────────────────────────────────────
export const borrowings = mysqlTable("borrowings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bookId: int("bookId").notNull(),
  borrowDate: timestamp("borrowDate").defaultNow().notNull(),
  dueDate: timestamp("dueDate").notNull(),
  returnDate: timestamp("returnDate"),
  status: mysqlEnum("status", ["active", "returned", "overdue"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Borrowing = typeof borrowings.$inferSelect;
export type InsertBorrowing = typeof borrowings.$inferInsert;

// ─── Reviews ─────────────────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ─── Notifications ───────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["borrowing_due", "borrowing_overdue", "order_update", "system"]).default("system").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  relatedId: int("relatedId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
