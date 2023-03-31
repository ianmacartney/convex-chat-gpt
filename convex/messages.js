import { query, internalMutation } from "./_generated/server";

export const list = query(async ({ db }, opts) => {
  const resp = await db.query("messages").order("desc").paginate(opts);
  await Promise.all(
    resp.page.map(async (message) => {
      if (message.identityId) {
        const identity = await db.get(message.identityId);
        message.name = identity.name;
      } else {
        message.name = message.user?.givenName;
      }
      // Don't leak user details to client
      delete message.user;
    })
  );
  return resp;
});

export const send = internalMutation(
  async ({ db, auth }, { body, identityName, threadId }) => {
    if (!(await auth.getUserIdentity())) throw new Error("Not authenticated");
    const userMessageId = await db.insert("messages", {
      body,
      author: "user",
      threadId,
      user: await auth.getUserIdentity(),
    });

    const { instructions, _id: identityId } = await db
      .query("identities")
      .filter((q) => q.eq(q.field("name"), identityName))
      .unique();
    const botMessageId = await db.insert("messages", {
      author: "assistant",
      threadId,
      identityId,
    });
    const messages = await db
      .query("messages")
      .order("desc")
      .filter((q) => q.eq(q.field("error"), null))
      .filter((q) => q.eq(q.field("threadId"), threadId))
      .filter((q) => q.neq(q.field("body"), null))
      .take(21); // 10 pairs of prompt/response and our most recent message.
    messages.reverse();
    await Promise.all(
      messages.map(async (msg) => {
        if (msg.identityId) {
          const identity = await db.get(msg.identityId);
          msg.instructions = identity.instructions;
        }
        delete msg.user;
      })
    );
    return { instructions, messages, userMessageId, botMessageId };
  }
);

export const update = internalMutation(async ({ db }, { messageId, patch }) => {
  await db.patch(messageId, patch);
});
