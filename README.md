# ChatGPT Convex demo

This example app demonstrates how to use the
[OpenAI ChatGPT API](https://platform.openai.com/docs/guides/chat) with
[Convex](https://convex.dev) to implement a chat. Convex stores the messages and
runs server-side functions to interact with OpenAI.

![Example](./example.png)

Features:
- You can chat and get responses from the Chat GPT api.
- You can start new threads to reset your conversation with Chat GPT.
- You can specify what the chat identity is, and change it mid-thread.
- You can make new identities.
- Inputs are checked for offensive input using the moderation api.

This uses [Convex actions](https://docs.convex.dev/using/actions) to make
requests to OpenAI's API.

## Running the App

Run:

```
npm install
npm run dev
```

This will create and configure a Convex project if you don't already have one.

### OpenAI API Setup

Create a free account on openai.com and create your
[OpenAI API secret key](https://platform.openai.com/account/api-keys), and set it as
an [environment variable](https://docs.convex.dev/using/environment-variables)
with the name `OPENAI_API_KEY` via the
[Convex dashboard](https://dashboard.convex.dev/).

Then visit [localhost:3000](http://localhost:3000).

## Identities

You can add identities to talk to. I added:

**Rubber Duck**
> You are curious and respond with helpful one-sentence questions.

**Supportive Friend**
> You are a supportive and curious best friend who validates feelings and experiences and will give advice only when asked for it. You give short responses and ask questions to learn more.

**CS Coach**
> You are a highly technically trained coach with expertise in technology and best practices for developing software. Respond with concise, precise messages and ask clarifying questions when things are unclear.

# What is Convex?

[Convex](https://convex.dev) is a hosted backend platform with a
built-in database that lets you write your
[database schema](https://docs.convex.dev/database/schemas) and
[server functions](https://docs.convex.dev/functions) in
[TypeScript](https://docs.convex.dev/typescript). Server-side database
[queries](https://docs.convex.dev/functions/query-functions) automatically
[cache](https://docs.convex.dev/functions/query-functions#caching--reactivity) and
[subscribe](https://docs.convex.dev/client/react#reactivity) to data, powering a
[realtime `useQuery` hook](https://docs.convex.dev/client/react#fetching-data) in our
[React client](https://docs.convex.dev/client/react). There are also
[Python](https://docs.convex.dev/client/python),
[Rust](https://docs.convex.dev/client/rust),
[ReactNative](https://docs.convex.dev/client/react-native), and
[Node](https://docs.convex.dev/client/javascript) clients, as well as a straightforward
[HTTP API](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L40).

The database support
[NoSQL-style documents](https://docs.convex.dev/database/document-storage) with
[relationships](https://docs.convex.dev/database/document-ids) and
[custom indexes](https://docs.convex.dev/database/indexes/)
(including on fields in nested objects).

The
[`query`](https://docs.convex.dev/functions/query-functions) and
[`mutation`](https://docs.convex.dev/functions/mutation-functions) server functions have transactional,
low latency access to the database and leverage our
[`v8` runtime](https://docs.convex.dev/functions/runtimes) with
[determinism guardrails](https://docs.convex.dev/functions/runtimes#using-randomness-and-time-in-queries-and-mutations)
to provide the strongest ACID guarantees on the market:
immediate consistency,
serializable isolation, and
automatic conflict resolution via
[optimistic multi-version concurrency control](https://docs.convex.dev/database/advanced/occ) (OCC / MVCC).

The [`action` server functions](https://docs.convex.dev/functions/actions) have
access to external APIs and enable other side-effects and non-determinism in
either our
[optimized `v8` runtime](https://docs.convex.dev/functions/runtimes) or a more
[flexible `node` runtime](https://docs.convex.dev/functions/runtimes#nodejs-runtime).

Functions can run in the background via
[scheduling](https://docs.convex.dev/scheduling/scheduled-functions) and
[cron jobs](https://docs.convex.dev/scheduling/cron-jobs).

Development is cloud-first, with
[hot reloads for server function](https://docs.convex.dev/cli#run-the-convex-dev-server) editing via the
[CLI](https://docs.convex.dev/cli). There is a
[dashbord UI](https://docs.convex.dev/dashboard) to
[browse and edit data](https://docs.convex.dev/dashboard/deployments/data),
[edit environment variables](https://docs.convex.dev/production/environment-variables),
[view logs](https://docs.convex.dev/dashboard/deployments/logs),
[run server functions](https://docs.convex.dev/dashboard/deployments/functions), and more.

There are built-in features for
[reactive pagination](https://docs.convex.dev/database/pagination),
[file storage](https://docs.convex.dev/file-storage),
[reactive search](https://docs.convex.dev/text-search),
[https endpoints](https://docs.convex.dev/functions/http-actions) (for webhooks),
[streaming import/export](https://docs.convex.dev/database/import-export/), and
[runtime data validation](https://docs.convex.dev/database/schemas#validators) for
[function arguments](https://docs.convex.dev/functions/args-validation) and
[database data](https://docs.convex.dev/database/schemas#schema-validation).

Everything scales automatically, and it’s [free to start](https://www.convex.dev/plans).
