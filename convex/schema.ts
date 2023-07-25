import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  identities: defineTable({
    flagged: v.optional(v.string()),
    instructions: v.string(),
    name: v.string(),
  }),
  messages: defineTable({
    author: v.union(v.literal("user"), v.literal("assistant")),
    threadId: v.id("threads"),
    // body starts out undefined for assistant messages
    body: v.optional(v.string()),
    // For messages authenticated with Clerk
    user: v.optional(v.any()),
    // For ChatGPT Messages
    error: v.optional(v.string()),
    identityId: v.optional(v.id("identities")),
    ms: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    usage: v.optional(
      v.object({
        completion_tokens: v.number(),
        prompt_tokens: v.number(),
        total_tokens: v.number(),
      })
    ),
  }),
  threads: defineTable({}),
});
