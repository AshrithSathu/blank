import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// @snippet start schema
export default defineSchema({
  auth: defineTable({
    email: v.string(),
    password: v.string(),
    name: v.string(),
    image: v.string(),
    lastLoginAt: v.number(),
  }).index("by_email", ["email"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.id("auth"),
  }).index("by_user", ["userId"]),
});
