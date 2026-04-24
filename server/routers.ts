import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";
import * as db from "./db";

// ─── Auth Router ─────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      avatarUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
  getUser: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const user = await db.getUserById(input.id);
      if (!user) return null;
      return { id: user.id, name: user.name, avatarUrl: user.avatarUrl, bio: user.bio, createdAt: user.createdAt };
    }),
});

// ─── Books Router ────────────────────────────────────────────────────
const booksRouter = router({
  list: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      category: z.string().optional(),
      condition: z.string().optional(),
      listingType: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      status: z.string().optional(),
      sellerId: z.number().optional(),
      sortBy: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      return db.searchBooks(input ?? {});
    }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const book = await db.getBookById(input.id);
      if (!book) return null;
      const seller = await db.getUserById(book.sellerId);
      const rating = await db.getBookAverageRating(input.id);
      return { ...book, seller: seller ? { id: seller.id, name: seller.name, avatarUrl: seller.avatarUrl } : null, rating };
    }),
  featured: publicProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return db.getFeaturedBooks(input?.limit ?? 8);
    }),
  categories: publicProcedure.query(async () => {
    return db.getBookCategories();
  }),
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      isbn: z.string().optional(),
      coverImageUrl: z.string().optional(),
      price: z.string(),
      originalPrice: z.string().optional(),
      condition: z.enum(["new", "like_new", "good", "fair", "poor"]),
      category: z.string().min(1),
      language: z.string().optional(),
      pageCount: z.number().optional(),
      publishYear: z.number().optional(),
      listingType: z.enum(["sell", "lend", "both"]),
      authorName: z.string().optional(),
      publisherName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const bookId = await db.createBook({
        ...input,
        sellerId: ctx.user.id,
      });
      return { id: bookId };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      isbn: z.string().optional(),
      coverImageUrl: z.string().optional(),
      price: z.string().optional(),
      originalPrice: z.string().optional(),
      condition: z.enum(["new", "like_new", "good", "fair", "poor"]).optional(),
      category: z.string().optional(),
      language: z.string().optional(),
      pageCount: z.number().optional(),
      publishYear: z.number().optional(),
      listingType: z.enum(["sell", "lend", "both"]).optional(),
      authorName: z.string().optional(),
      publisherName: z.string().optional(),
      status: z.enum(["available", "sold", "borrowed", "unavailable"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const book = await db.getBookById(input.id);
      if (!book) throw new Error("Book not found");
      if (book.sellerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Unauthorized");
      const { id, ...data } = input;
      await db.updateBook(id, data);
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const book = await db.getBookById(input.id);
      if (!book) throw new Error("Book not found");
      if (book.sellerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Unauthorized");
      await db.deleteBook(input.id);
      return { success: true };
    }),
  uploadCover: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileBase64: z.string(),
      contentType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `book-covers/${ctx.user.id}/${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(key, buffer, input.contentType);
      return { url };
    }),
  bySeller: protectedProcedure.query(async ({ ctx }) => {
    return db.getBooksBySellerId(ctx.user.id);
  }),
});

// ─── Cart Router ─────────────────────────────────────────────────────
const cartRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return db.getCartItems(ctx.user.id);
  }),
  add: protectedProcedure
    .input(z.object({ bookId: z.number(), quantity: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      await db.addToCart(ctx.user.id, input.bookId, input.quantity ?? 1);
      return { success: true };
    }),
  updateQuantity: protectedProcedure
    .input(z.object({ id: z.number(), quantity: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateCartItemQuantity(input.id, input.quantity);
      return { success: true };
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.removeCartItem(input.id);
      return { success: true };
    }),
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    await db.clearCart(ctx.user.id);
    return { success: true };
  }),
});

// ─── Orders Router ───────────────────────────────────────────────────
const ordersRouter = router({
  create: protectedProcedure
    .input(z.object({
      paymentMethod: z.string(),
      shippingAddress: z.string(),
      shippingCity: z.string(),
      shippingZip: z.string(),
      shippingCountry: z.string(),
      items: z.array(z.object({
        bookId: z.number(),
        quantity: z.number(),
        priceAtPurchase: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const totalAmount = input.items.reduce((sum, item) => sum + parseFloat(item.priceAtPurchase) * item.quantity, 0);
      const orderId = await db.createOrder({
        buyerId: ctx.user.id,
        totalAmount: String(totalAmount),
        paymentMethod: input.paymentMethod,
        shippingAddress: input.shippingAddress,
        shippingCity: input.shippingCity,
        shippingZip: input.shippingZip,
        shippingCountry: input.shippingCountry,
        status: "paid",
      }, input.items);
      await db.clearCart(ctx.user.id);
      return { orderId };
    }),
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    return db.getOrdersByUserId(ctx.user.id);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const order = await db.getOrderById(input.id);
      if (!order) return null;
      if (order.buyerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Unauthorized");
      return order;
    }),
});

// ─── Borrowings Router ───────────────────────────────────────────────
const borrowingsRouter = router({
  create: protectedProcedure
    .input(z.object({
      bookId: z.number(),
      dueDate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const book = await db.getBookById(input.bookId);
      if (!book) throw new Error("Book not found");
      if (book.status !== "available") throw new Error("Book is not available for borrowing");
      if (book.listingType !== "lend" && book.listingType !== "both") throw new Error("Book is not available for borrowing");
      const borrowingId = await db.createBorrowing({
        userId: ctx.user.id,
        bookId: input.bookId,
        dueDate: new Date(input.dueDate),
      });
      return { borrowingId };
    }),
  return: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.returnBorrowing(input.id);
      return { success: true };
    }),
  myBorrowings: protectedProcedure.query(async ({ ctx }) => {
    return db.getBorrowingsByUserId(ctx.user.id);
  }),
});

// ─── Reviews Router ──────────────────────────────────────────────────
const reviewsRouter = router({
  byBook: publicProcedure
    .input(z.object({ bookId: z.number() }))
    .query(async ({ input }) => {
      return db.getReviewsByBookId(input.bookId);
    }),
  create: protectedProcedure
    .input(z.object({
      bookId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const reviewId = await db.createReview({
        bookId: input.bookId,
        userId: ctx.user.id,
        rating: input.rating,
        comment: input.comment,
      });
      return { reviewId };
    }),
});

// ─── Authors Router ──────────────────────────────────────────────────
const authorsRouter = router({
  list: publicProcedure.query(async () => {
    return db.getAllAuthors();
  }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const author = await db.getAuthorById(input.id);
      if (!author) return null;
      const authorBooks = await db.getBooksByAuthorId(input.id);
      return { ...author, books: authorBooks };
    }),
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      bio: z.string().optional(),
      photoUrl: z.string().optional(),
      website: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createAuthor(input);
      return { id };
    }),
});

// ─── Publishers Router ───────────────────────────────────────────────
const publishersRouter = router({
  list: publicProcedure.query(async () => {
    return db.getAllPublishers();
  }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const publisher = await db.getPublisherById(input.id);
      if (!publisher) return null;
      const publisherBooks = await db.getBooksByPublisherId(input.id);
      return { ...publisher, books: publisherBooks };
    }),
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      logoUrl: z.string().optional(),
      website: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createPublisher(input);
      return { id };
    }),
});

// ─── Notifications Router ────────────────────────────────────────────
const notificationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getNotificationsByUserId(ctx.user.id);
  }),
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return db.getUnreadNotificationCount(ctx.user.id);
  }),
  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.markNotificationRead(input.id);
      return { success: true };
    }),
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await db.markAllNotificationsRead(ctx.user.id);
    return { success: true };
  }),
});

// ─── Admin Router ────────────────────────────────────────────────────
const adminRouter = router({
  stats: adminProcedure.query(async () => {
    return db.getAdminStats();
  }),
  users: adminProcedure
    .input(z.object({ page: z.number().optional(), limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return db.getAllUsers(input?.page ?? 1, input?.limit ?? 20);
    }),
  toggleBan: adminProcedure
    .input(z.object({ userId: z.number(), isBanned: z.boolean() }))
    .mutation(async ({ input }) => {
      await db.toggleUserBan(input.userId, input.isBanned);
      return { success: true };
    }),
  allOrders: adminProcedure
    .input(z.object({ page: z.number().optional(), limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return db.getAllOrders(input?.page ?? 1, input?.limit ?? 20);
    }),
  updateOrderStatus: adminProcedure
    .input(z.object({ orderId: z.number(), status: z.string() }))
    .mutation(async ({ input }) => {
      await db.updateOrderStatus(input.orderId, input.status);
      return { success: true };
    }),
  allBorrowings: adminProcedure
    .input(z.object({ page: z.number().optional(), limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return db.getAllBorrowings(input?.page ?? 1, input?.limit ?? 20);
    }),
  allBooks: adminProcedure
    .input(z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return db.searchBooks({ page: input?.page ?? 1, limit: input?.limit ?? 20, search: input?.search });
    }),
  deleteBook: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteBook(input.id);
      return { success: true };
    }),
  returnBorrowing: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.returnBorrowing(input.id);
      return { success: true };
    }),
});

// ─── App Router ──────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  books: booksRouter,
  cart: cartRouter,
  orders: ordersRouter,
  borrowings: borrowingsRouter,
  reviews: reviewsRouter,
  authors: authorsRouter,
  publishers: publishersRouter,
  notifications: notificationsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
