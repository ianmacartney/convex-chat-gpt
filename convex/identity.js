import { query, mutation } from "./_generated/server";

export const list = query(async ({ db }) => {
  const identities = await db.query("identities").collect();
  return identities.map((identity) => identity.name);
});

export const add = mutation(async ({ db }, name, instructions) => {
  const existing = await db
    .query("identities")
    .filter((q) => q.eq(q.field("name"), name))
    .unique();
  if (existing) {
    await db.patch(existing._id, { instructions });
    return existing._id;
  } else {
    return db.insert("identities", { name, instructions });
  }
});
