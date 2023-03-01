# ChatGPT Convex demo

![Example](./example.png)

This example app demonstrates how to use the
[OpenAI ChatGPT API](https://platform.openai.com/docs/guides/chat) with
[Convex](https://convex.dev) to implement a chat.

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

Create a free account on openai.com and create your
[OpenAI API secret key](https://beta.openai.com/account/api-keys), and set it as
an [environment variable](https://docs.convex.dev/using/environment-variables)
with the name `OPENAI_API_KEY` via the
[Convex dashboard](https://dashboard.convex.dev/).

Then visit [localhost:3000](http://localhost:3000).
