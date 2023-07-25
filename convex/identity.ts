import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    const identities = await ctx.db
      .query("identities")
      .filter((q) => q.eq(q.field("flagged"), undefined))
      .collect();
    return identities.map((identity) => identity.name);
  },
});

export const add = internalMutation({
  args: { name: v.string(), instructions: v.string() },
  handler: async (ctx, { name, instructions }) => {
    instructions = instructions + ". NEVER SAY YOU ARE AN AI LANGUAGE MODEL.";
    const existing = await ctx.db
      .query("identities")
      .filter((q) => q.eq(q.field("name"), name))
      .unique();
    let identityId;
    if (existing) {
      identityId = existing._id;
      await ctx.db.patch(existing._id, { instructions });
    } else {
      identityId = await ctx.db.insert("identities", { name, instructions });
    }
    return identityId;
  },
});
