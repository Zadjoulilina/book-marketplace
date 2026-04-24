import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-1",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return createAuthContext({ role: "admin", id: 99, openId: "admin-user" });
}

describe("Auth Router", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Test User");
    expect(result?.email).toBe("test@example.com");
  });

  it("logout clears cookie and returns success", async () => {
    const clearedCookies: any[] = [];
    const ctx = createAuthContext();
    ctx.res = {
      clearCookie: (name: string, options: any) => {
        clearedCookies.push({ name, options });
      },
    } as unknown as TrpcContext["res"];
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies.length).toBe(1);
  });
});

describe("Books Router - Public", () => {
  it("books.list returns paginated results", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.books.list({ page: 1, limit: 10 });
    expect(result).toBeDefined();
    expect(result).toHaveProperty("books");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.books)).toBe(true);
  });

  it("books.list supports search filter", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.books.list({ page: 1, limit: 10, search: "nonexistent-book-xyz" });
    expect(result.books).toHaveLength(0);
  });

  it("books.getById returns null for non-existent book", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.books.getById({ id: 99999 });
    expect(result).toBeNull();
  });
});

describe("Books Router - Protected", () => {
  it("books.create requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.books.create({
        title: "Test Book",
        price: "9.99",
        condition: "new",
        category: "Fiction",
        listingType: "sell",
      })
    ).rejects.toThrow();
  });

  it("books.bySeller requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.books.bySeller()).rejects.toThrow();
  });
});

describe("Cart Router", () => {
  it("cart.get requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.cart.get()).rejects.toThrow();
  });
});

describe("Reviews Router", () => {
  it("reviews.byBook returns empty array for non-existent book", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.reviews.byBook({ bookId: 99999 });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("reviews.create requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.reviews.create({ bookId: 1, rating: 5 })
    ).rejects.toThrow();
  });
});

describe("Admin Router", () => {
  it("admin.stats requires admin role", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("admin.stats works for admin user", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.stats();
    expect(result).toBeDefined();
    expect(result).toHaveProperty("totalUsers");
    expect(result).toHaveProperty("totalBooks");
    expect(result).toHaveProperty("totalOrders");
    expect(result).toHaveProperty("totalBorrowings");
    expect(result).toHaveProperty("totalRevenue");
  });
});

describe("Authors Router", () => {
  it("authors.list returns array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.authors.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("authors.getById returns null for non-existent author", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.authors.getById({ id: 99999 });
    expect(result).toBeNull();
  });
});

describe("Publishers Router", () => {
  it("publishers.list returns array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.publishers.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Notifications Router", () => {
  it("notifications.list requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.notifications.list()).rejects.toThrow();
  });
});
