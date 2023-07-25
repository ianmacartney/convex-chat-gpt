import { query, mutation } from "./_generated/server";

export const latest = query({
  handler: async (ctx) => {
    return ctx.db.query("threads").order("desc").first();
  },
});

export const add = mutation({
  args: {},
  handler: async (ctx, thread) => {
    return ctx.db.insert("threads", thread || {});
  },
});
