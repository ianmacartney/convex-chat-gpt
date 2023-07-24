import { query, internalMutation } from "./_generated/server";

export const list = query({
  handler: async (ctx, { paginationOpts }) => {
    const resp = await ctx.db
      .query("messages")
      .order("desc")
      .paginate(paginationOpts);
    await Promise.all(
      resp.page.map(async (message) => {
        if (message.identityId) {
          const identity = await ctx.db.get(message.identityId);
          message.name = identity.name;
        } else {
          message.name = message.user?.givenName;
        }
        // Don't leak user details to client
        delete message.user;
      })
    );
    return resp;
  },
});

export const send = internalMutation({
  handler: async (ctx, { body, identityName, threadId }) => {
    const userMessageId = await ctx.db.insert("messages", {
      body,
      author: "user",
      threadId,
    });

    const { instructions, _id: identityId } = await ctx.db
      .query("identities")
      .filter((q) => q.eq(q.field("name"), identityName))
      .unique();
    const botMessageId = await ctx.db.insert("messages", {
      author: "assistant",
      threadId,
      identityId,
    });
    const messages = await ctx.db
      .query("messages")
      .order("desc")
      .filter((q) => q.eq(q.field("error"), undefined))
      .filter((q) => q.eq(q.field("threadId"), threadId))
      .filter((q) => q.neq(q.field("body"), undefined))
      .take(21); // 10 pairs of prompt/response and our most recent message.
    messages.reverse();
    await Promise.all(
      messages.map(async (msg) => {
        if (msg.identityId) {
          const identity = await ctx.db.get(msg.identityId);
          msg.instructions = identity.instructions;
        }
        delete msg.user;
      })
    );
    return { instructions, messages, userMessageId, botMessageId };
  },
});

export const update = internalMutation({
  handler: async (ctx, { messageId, patch }) => {
    await ctx.db.patch(messageId, patch);
  },
});
