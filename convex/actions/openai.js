import { Configuration, OpenAIApi } from "openai";
import { action } from "../_generated/server";

export const moderateIdentity = action(
  async ({ runMutation }, instructions, identityId) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      await runMutation(
        "identity:flag",
        identityId,
        "️Add your OPENAI_API_KEY as an env variable in the " +
          "[dashboard](https://dashboard.convex.dev)"
      );
      return;
    }
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    // Check if the message is offensive.
    const modResponse = await openai.createModeration({
      input: instructions,
    });
    const modResult = modResponse.data.results[0];
    if (modResult.flagged) {
      await runMutation(
        "identity:flag",
        identityId,
        Object.entries(modResult.categories)
          .filter(([, flagged]) => flagged)
          .map(([category]) => category)
          .join(", ")
      );
    }
  }
);

export const gpt3 = action(
  async ({ runMutation }, instructions, messages, messageId) => {
    const fail = (reason) =>
      runMutation("messages:update", messageId, {
        error: reason,
      }).then(() => {
        throw new Error(reason);
      });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      await fail(
        "Add your OPENAI_API_KEY as an env variable in the " +
          "[dashboard](https://dasboard.convex.dev)"
      );
    }
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    // Check if the message is offensive.
    const modResponse = await openai.createModeration({
      input: messages[messages.length - 1].body,
    });
    const modResult = modResponse.data.results[0];
    if (modResult.flagged) {
      await runMutation("messages:update", messages[messages.length - 1]._id, {
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
        content: instructions,
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
    const body = openaiResponse.data.choices[0].message.content;

    await runMutation("messages:update", messageId, {
      body,
      usage: openaiResponse.data.usage,
      updatedAt: Date.now(),
      ms: Number(openaiResponse.headers["openai-processing-ms"]),
    });
  }
);
