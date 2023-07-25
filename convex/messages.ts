import { paginationOptsValidator } from "convex/server";
import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const resp = await ctx.db
      .query("messages")
      .order("desc")
      .paginate(paginationOpts);
    const page = await Promise.all(
      resp.page.map(async (message) => {
        let name: string;
        if (message.identityId) {
          const identity = (await ctx.db.get(message.identityId))!;
          name = identity.name;
        } else {
          name = message.user?.givenName;
        }
        // Don't leak user details to client
        return { ...message, name, user: undefined };
      })
    );
    return { ...resp, page };
  },
});

export const send = internalMutation({
  args: {
    body: v.string(),
    identityName: v.string(),
    threadId: v.id("threads"),
  },
  handler: async (ctx, { body, identityName, threadId }) => {
    const userMessageId = await ctx.db.insert("messages", {
      body,
      author: "user",
      threadId,
    });

    const identity = await ctx.db
      .query("identities")
      .filter((q) => q.eq(q.field("name"), identityName))
      .unique();
    if (!identity) throw new Error("Can't find identity " + identityName);
    const { instructions, _id: identityId } = identity;
    const botMessageId = await ctx.db.insert("messages", {
      author: "assistant",
      threadId,
      identityId,
    });
    const messageDocs = await ctx.db
      .query("messages")
      .order("desc")
      .filter((q) => q.eq(q.field("error"), undefined))
      .filter((q) => q.eq(q.field("threadId"), threadId))
      .filter((q) => q.neq(q.field("body"), undefined))
      .take(21); // 10 pairs of prompt/response and our most recent message.
    const messages = await Promise.all(
      messageDocs.reverse().map(async (msg) => {
        let instructions = undefined;
        if (msg.identityId) {
          const identity = (await ctx.db.get(msg.identityId))!;
          instructions = identity.instructions;
        }
        return { ...msg, instructions, user: undefined };
      })
    );
    return { instructions, messages, userMessageId, botMessageId };
  },
});

export const update = internalMutation({
  handler: async (
    ctx,
    args: { messageId: Id<"messages">; patch: Partial<Doc<"messages">> }
  ) => {
    await ctx.db.patch(args.messageId, args.patch);
  },
});
