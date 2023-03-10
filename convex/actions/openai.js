import { Configuration, OpenAIApi } from "openai";
import { action } from "../_generated/server";

export const moderateIdentity = action(
  async ({ runMutation }, name, instructions) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return (
        "️Add your OPENAI_API_KEY as an env variable in the " +
        "[dashboard](https://dashboard.convex.dev)"
      );
    }
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    // Check if the message is offensive.
    const modResponse = await openai.createModeration({
      input: name + ": " + instructions,
    });

    const modResult = modResponse.data.results[0];
    if (modResult.flagged) {
      return (
        "Flagged: " +
        Object.entries(modResult.categories)
          .filter(([, flagged]) => flagged)
          .map(([category]) => category)
          .join(", ")
      );
    }
    await runMutation("identity:add", name, instructions);
  }
);

export const chat = action(
  async ({ runMutation }, body, identityName, threadId) => {
    const { instructions, messages, userMessageId, botMessageId } =
      await runMutation("messages:send", body, identityName, threadId);
    const fail = (reason) =>
      runMutation("messages:update", botMessageId, {
        error: reason,
      }).then(() => {
        throw new Error(reason);
      });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      await fail(
        "Add your OPENAI_API_KEY as an env variable in the dashboard:" +
          "https://dashboard.convex.dev"
      );
    }
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    // Check if the message is offensive.
    const modResponse = await openai.createModeration({
      input: body,
    });
    const modResult = modResponse.data.results[0];
    if (modResult.flagged) {
      await runMutation("messages:update", userMessageId, {
        error:
          "Your message was flagged: " +
          Object.entries(modResult.categories)
            .filter(([, flagged]) => flagged)
            .map(([category]) => category)
            .join(", "),
      });
      return;
    }

    const gptMessages = [];
    let lastInstructions = null;
    for (const { body, author, instructions } of messages) {
      if (instructions && instructions !== lastInstructions) {
        gptMessages.push({
          role: "system",
          content: instructions,
        });
        lastInstructions = instructions;
      }
      gptMessages.push({ role: author, content: body });
    }
    if (instructions !== lastInstructions) {
      gptMessages.push({
        role: "system",
        content: instructions ?? "You are a helpful assistant",
      });
      lastInstructions = instructions;
    }

    const openaiResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: gptMessages,
    });
    if (openaiResponse.status !== 200) {
      await fail("OpenAI error: " + openaiResponse.statusText);
    }
    await runMutation("messages:update", botMessageId, {
      body: openaiResponse.data.choices[0].message.content,
      usage: openaiResponse.data.usage,
      updatedAt: Date.now(),
      ms: Number(openaiResponse.headers["openai-processing-ms"]),
    });
  }
);
