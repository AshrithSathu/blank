import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserDocument = query({
  args: {
    userEmail: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("documents"),
      _creationTime: v.number(),
      title: v.string(),
      content: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      userId: v.id("auth"),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // First, get the user by email
    const user = await ctx.db
      .query("auth")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .unique();

    if (!user) {
      return null;
    }

    // Try to find existing document for this user
    const document = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    return document;
  },
});

export const createUserDocument = mutation({
  args: {
    userEmail: v.string(),
  },
  returns: v.id("documents"),
  handler: async (ctx, args) => {
    // First, get the user by email
    const user = await ctx.db
      .query("auth")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if document already exists
    const existingDocument = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existingDocument) {
      return existingDocument._id;
    }

    // Create new document
    const now = Date.now();
    const documentId = await ctx.db.insert("documents", {
      title: "Untitled Document",
      content: "",
      createdAt: now,
      updatedAt: now,
      userId: user._id,
    });

    return documentId;
  },
});

export const updateUserDocument = mutation({
  args: {
    userEmail: v.string(),
    title: v.string(),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // First, get the user by email
    const user = await ctx.db
      .query("auth")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Find the user's document
    const document = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!document) {
      throw new Error("Document not found");
    }

    // Update the document
    await ctx.db.patch(document._id, {
      title: args.title,
      content: args.content,
      updatedAt: Date.now(),
    });

    return null;
  },
});
