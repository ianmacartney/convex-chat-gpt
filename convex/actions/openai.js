"use node";
import { Configuration, OpenAIApi } from "openai";
import { action } from "../_generated/server";

export const moderateIdentity = action(
  async ({ runMutation }, { name, instructions }) => {
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
      return "Flagged: " + flaggedCategories(modResult).join(", ");
    }
    await runMutation("identity:add", { name, instructions });
  }
);

const flaggedCategories = (modResult) => {
  return Object.entries(modResult.categories)
    .filter(([, flagged]) => flagged)
    .map(([category]) => category);
};

export const chat = action(
  async ({ runMutation }, { body, identityName, threadId }) => {
    const { instructions, messages, userMessageId, botMessageId } =
      await runMutation("messages:send", { body, identityName, threadId });
    const fail = (reason) =>
      runMutation("messages:update", {
        messageId: botMessageId,
        patch: {
          error: reason,
        },
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
    try {
      const modResponse = await openai.createModeration({
        input: body,
      });
      const modResult = modResponse.data.results[0];
      if (modResult.flagged) {
        await runMutation("messages:update", {
          messageId: userMessageId,
          patch: {
            error:
              "Your message was flagged: " +
              flaggedCategories(modResult).join(", "),
          },
        });
        return;
      }
    } catch (e) {
      await fail(`${e}`);
    }

    const gptMessages = [];
    let lastInstructions = null;
    for (const { body, author, instructions, name } of messages) {
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

    try {
      const openaiResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: gptMessages,
      });
      await runMutation("messages:update", {
        messageId: botMessageId,
        patch: {
          body: openaiResponse.data.choices[0].message.content,
          usage: openaiResponse.data.usage,
          updatedAt: Date.now(),
          ms: Number(openaiResponse.headers["openai-processing-ms"]),
        },
      });
    } catch (e) {
      await fail(`OpenAI error: ${e}`);
    }
  }
);
