import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrUpdateUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    image: v.string(),
  },
  returns: v.id("auth"),
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("auth")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      // Update existing user with new login time and potentially updated info
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        image: args.image,
        lastLoginAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("auth", {
        email: args.email,
        password: "", // Empty for OAuth users
        name: args.name,
        image: args.image,
        lastLoginAt: Date.now(),
      });
      return userId;
    }
  },
});

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("auth"),
      _creationTime: v.number(),
      email: v.string(),
      password: v.string(),
      name: v.string(),
      image: v.string(),
      lastLoginAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("auth")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    return user || null;
  },
});
