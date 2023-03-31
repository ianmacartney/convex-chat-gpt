import { query, mutation } from "./_generated/server";

export const list = query(async ({ db }) => {
  const identities = await db
    .query("identities")
    .filter((q) => q.eq(q.field("flagged"), null))
    .collect();
  return identities.map((identity) => identity.name);
});

export const add = mutation(async ({ db }, { name, instructions }) => {
  instructions = instructions + ". NEVER SAY YOU ARE AN AI LANGUAGE MODEL.";
  const existing = await db
    .query("identities")
    .filter((q) => q.eq(q.field("name"), name))
    .unique();
  let identityId;
  if (existing) {
    identityId = existing._id;
    await db.patch(existing._id, { instructions });
  } else {
    identityId = await db.insert("identities", { name, instructions });
  }
  return identityId;
});