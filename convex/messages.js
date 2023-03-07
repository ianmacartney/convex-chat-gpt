import { query, mutation } from "./_generated/server";

export const list = query(async ({ db }, opts) => {
  const resp = await db.query("messages").order("desc").paginate(opts);
  await Promise.all(
    resp.page.map(async (message) => {
      if (message.identityId) {
        const identity = await db.get(message.identityId);
        message.identityName = identity.name;
      }
      // Don't leak user details to client
      delete message.user;
    })
  );
  return resp;
});

export const send = mutation(
  async ({ db, auth }, body, identityName, threadId) => {
    //if (!(await auth.getUserIdentity())) throw new Error("Not authenticated");
    await db.insert("messages", {
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
      .take(10);
    messages.reverse();
    await Promise.all(
      messages.map(async (msg) => {
        if (msg.identityId) {
          msg.instructions = (await db.get(msg.identityId)).instructions;
        }
      })
    );
    scheduler.runAfter(
      0,
      "actions/openai:gpt3",
      instructions ?? "You are a helpful assistant.",
      messages,
      botMessageId
    );
  }
);

export const update = mutation(async ({ db }, messageId, patch) => {
  await db.patch(messageId, patch);
});
