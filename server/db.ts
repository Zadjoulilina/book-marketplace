import { eq, and, like, or, sql, desc, asc, gte, lte, inArray, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  books, InsertBook,
  cartItems, InsertCartItem,
  orders, InsertOrder,
  orderItems, InsertOrderItem,
  borrowings, InsertBorrowing,
  reviews, InsertReview,
  authors, InsertAuthor,
  publishers, InsertPublisher,
  notifications, InsertNotification,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: { name?: string; bio?: string; phone?: string; address?: string; avatarUrl?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getAllUsers(page: number = 1, limit: number = 20) {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };
  const offset = (page - 1) * limit;
  const [rows, countResult] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(users),
  ]);
  return { users: rows, total: countResult[0]?.count ?? 0 };
}

export async function toggleUserBan(userId: number, isBanned: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ isBanned }).where(eq(users.id, userId));
}

// ─── Books ───────────────────────────────────────────────────────────
export async function createBook(data: InsertBook) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(books).values(data);
  return result[0].insertId;
}

export async function getBookById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBook(id: number, data: Partial<InsertBook>) {
  const db = await getDb();
  if (!db) return;
  await db.update(books).set(data).where(eq(books.id, id));
}

export async function deleteBook(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(books).where(eq(books.id, id));
}

export async function searchBooks(params: {
  search?: string;
  category?: string;
  condition?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  sellerId?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { books: [], total: 0 };

  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const offset = (page - 1) * limit;
  const conditions = [];

  if (params.search) {
    const term = `%${params.search}%`;
    conditions.push(or(like(books.title, term), like(books.authorName, term), like(books.description, term)));
  }
  if (params.category) conditions.push(eq(books.category, params.category));
  if (params.condition) conditions.push(eq(books.condition, params.condition as any));
  if (params.listingType) conditions.push(eq(books.listingType, params.listingType as any));
  if (params.minPrice !== undefined) conditions.push(gte(books.price, String(params.minPrice)));
  if (params.maxPrice !== undefined) conditions.push(lte(books.price, String(params.maxPrice)));
  if (params.status) conditions.push(eq(books.status, params.status as any));
  if (params.sellerId) conditions.push(eq(books.sellerId, params.sellerId));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderClause;
  switch (params.sortBy) {
    case "price_asc": orderClause = asc(books.price); break;
    case "price_desc": orderClause = desc(books.price); break;
    case "newest": orderClause = desc(books.createdAt); break;
    case "oldest": orderClause = asc(books.createdAt); break;
    default: orderClause = desc(books.createdAt);
  }

  const [rows, countResult] = await Promise.all([
    db.select().from(books).where(whereClause).orderBy(orderClause).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(books).where(whereClause),
  ]);

  return { books: rows, total: countResult[0]?.count ?? 0 };
}

export async function getFeaturedBooks(limit: number = 8) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(books).where(eq(books.status, "available")).orderBy(desc(books.createdAt)).limit(limit);
}

export async function getBooksByAuthorId(authorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(books).where(eq(books.authorId, authorId)).orderBy(desc(books.createdAt));
}

export async function getBooksBySellerId(sellerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(books).where(eq(books.sellerId, sellerId)).orderBy(desc(books.createdAt));
}

export async function getBooksByPublisherId(publisherId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(books).where(eq(books.publisherId, publisherId)).orderBy(desc(books.createdAt));
}

export async function getBookCategories() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ category: books.category }).from(books);
  return result.map(r => r.category);
}

// ─── Cart ────────────────────────────────────────────────────────────
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  if (items.length === 0) return [];
  const bookIds = items.map(i => i.bookId);
  const bookRows = await db.select().from(books).where(inArray(books.id, bookIds));
  const bookMap = new Map(bookRows.map(b => [b.id, b]));
  return items.map(item => ({ ...item, book: bookMap.get(item.bookId) }));
}

export async function addToCart(userId: number, bookId: number, quantity: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db.select().from(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.bookId, bookId))).limit(1);
  if (existing.length > 0) {
    await db.update(cartItems).set({ quantity: existing[0].quantity + quantity }).where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ userId, bookId, quantity });
  }
}

export async function updateCartItemQuantity(id: number, quantity: number) {
  const db = await getDb();
  if (!db) return;
  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
  }
}

export async function removeCartItem(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ─── Orders ──────────────────────────────────────────────────────────
export async function createOrder(data: InsertOrder, items: { bookId: number; quantity: number; priceAtPurchase: string }[]) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(orders).values(data);
  const orderId = result[0].insertId;
  if (items.length > 0) {
    await db.insert(orderItems).values(items.map(item => ({ ...item, orderId })));
  }
  // Mark books as sold
  for (const item of items) {
    await db.update(books).set({ status: "sold" }).where(eq(books.id, item.bookId));
  }
  return orderId;
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const orderRows = await db.select().from(orders).where(eq(orders.buyerId, userId)).orderBy(desc(orders.createdAt));
  const orderIds = orderRows.map(o => o.id);
  if (orderIds.length === 0) return orderRows.map(o => ({ ...o, items: [] }));
  const itemRows = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
  const bookIds = Array.from(new Set(itemRows.map(i => i.bookId)));
  const bookRows = bookIds.length > 0 ? await db.select().from(books).where(inArray(books.id, bookIds)) : [];
  const bookMap = new Map(bookRows.map(b => [b.id, b]));
  return orderRows.map(order => ({
    ...order,
    items: itemRows.filter(i => i.orderId === order.id).map(i => ({ ...i, book: bookMap.get(i.bookId) })),
  }));
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const orderRow = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (orderRow.length === 0) return undefined;
  const itemRows = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  const bookIds = itemRows.map(i => i.bookId);
  const bookRows = bookIds.length > 0 ? await db.select().from(books).where(inArray(books.id, bookIds)) : [];
  const bookMap = new Map(bookRows.map(b => [b.id, b]));
  return { ...orderRow[0], items: itemRows.map(i => ({ ...i, book: bookMap.get(i.bookId) })) };
}

export async function getAllOrders(page: number = 1, limit: number = 20) {
  const db = await getDb();
  if (!db) return { orders: [], total: 0 };
  const offset = (page - 1) * limit;
  const [rows, countResult] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(orders),
  ]);
  return { orders: rows, total: countResult[0]?.count ?? 0 };
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
}

// ─── Borrowings ──────────────────────────────────────────────────────
export async function createBorrowing(data: InsertBorrowing) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(borrowings).values(data);
  await db.update(books).set({ status: "borrowed" }).where(eq(books.id, data.bookId));
  return result[0].insertId;
}

export async function returnBorrowing(borrowingId: number) {
  const db = await getDb();
  if (!db) return;
  const row = await db.select().from(borrowings).where(eq(borrowings.id, borrowingId)).limit(1);
  if (row.length === 0) return;
  await db.update(borrowings).set({ status: "returned", returnDate: new Date() }).where(eq(borrowings.id, borrowingId));
  await db.update(books).set({ status: "available" }).where(eq(books.id, row[0].bookId));
}

export async function getBorrowingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(borrowings).where(eq(borrowings.userId, userId)).orderBy(desc(borrowings.borrowDate));
  if (rows.length === 0) return [];
  const bookIds = rows.map(r => r.bookId);
  const bookRows = await db.select().from(books).where(inArray(books.id, bookIds));
  const bookMap = new Map(bookRows.map(b => [b.id, b]));
  return rows.map(row => ({ ...row, book: bookMap.get(row.bookId) }));
}

export async function getAllBorrowings(page: number = 1, limit: number = 20) {
  const db = await getDb();
  if (!db) return { borrowings: [], total: 0 };
  const offset = (page - 1) * limit;
  const [rows, countResult] = await Promise.all([
    db.select().from(borrowings).orderBy(desc(borrowings.borrowDate)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(borrowings),
  ]);
  return { borrowings: rows, total: countResult[0]?.count ?? 0 };
}

// ─── Reviews ─────────────────────────────────────────────────────────
export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(reviews).values(data);
  return result[0].insertId;
}

export async function getReviewsByBookId(bookId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(reviews).where(eq(reviews.bookId, bookId)).orderBy(desc(reviews.createdAt));
  if (rows.length === 0) return [];
  const userIds = Array.from(new Set(rows.map(r => r.userId)));
  const userRows = await db.select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl }).from(users).where(inArray(users.id, userIds));
  const userMap = new Map(userRows.map(u => [u.id, u]));
  return rows.map(row => ({ ...row, user: userMap.get(row.userId) }));
}

export async function getBookAverageRating(bookId: number) {
  const db = await getDb();
  if (!db) return { avg: 0, count: 0 };
  const result = await db.select({ avg: sql<number>`AVG(rating)`, count: sql<number>`COUNT(*)` }).from(reviews).where(eq(reviews.bookId, bookId));
  return { avg: result[0]?.avg ?? 0, count: result[0]?.count ?? 0 };
}

// ─── Authors ─────────────────────────────────────────────────────────
export async function createAuthor(data: InsertAuthor) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(authors).values(data);
  return result[0].insertId;
}

export async function getAuthorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(authors).where(eq(authors.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllAuthors() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(authors).orderBy(asc(authors.name));
}

// ─── Publishers ──────────────────────────────────────────────────────
export async function createPublisher(data: InsertPublisher) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(publishers).values(data);
  return result[0].insertId;
}

export async function getPublisherById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(publishers).where(eq(publishers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllPublishers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(publishers).orderBy(asc(publishers.name));
}

// ─── Notifications ───────────────────────────────────────────────────
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(notifications).values(data);
}

export async function getNotificationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result[0]?.count ?? 0;
}

// ─── Stats (Admin) ───────────────────────────────────────────────────
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, totalBooks: 0, totalOrders: 0, totalBorrowings: 0, totalRevenue: 0 };
  const [userCount, bookCount, orderCount, borrowCount, revenueResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(books),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(borrowings),
    db.select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` }).from(orders).where(ne(orders.status, "cancelled")),
  ]);
  return {
    totalUsers: userCount[0]?.count ?? 0,
    totalBooks: bookCount[0]?.count ?? 0,
    totalOrders: orderCount[0]?.count ?? 0,
    totalBorrowings: borrowCount[0]?.count ?? 0,
    totalRevenue: revenueResult[0]?.total ?? 0,
  };
}
