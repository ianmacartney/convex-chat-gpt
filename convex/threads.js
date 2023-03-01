import { query, mutation } from "./_generated/server";

export const latest = query(async ({ db }) => {
  return db.query("threads").order("desc").first();
});

export const add = mutation(async ({ db }, thread) => {
  return db.insert("threads", thread || {});
});
