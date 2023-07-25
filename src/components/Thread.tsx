import { api } from "../../convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

export type UIMessage = {
  name: string;
  author: string;
  identityId?: Id<"identities">;
  threadId: Id<"threads">;
  body?: string;
  error?: string;
  updatedAt?: number;
  _id: Id<"messages">;
  _creationTime: number;
};

export function Thread({
  threadId,
  messages,
}: {
  threadId: Id<"threads">;
  messages: UIMessage[];
}) {
  const identities = useQuery(api.identity.list);
  const [identityName, setIdentityName] = useState<string>();
  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useAction(api.openai.chat);
  useEffect(() => {
    if (identities?.length && !identityName) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage?.identityId &&
        identities.indexOf(lastMessage.name) !== -1
      ) {
        if (identityName !== lastMessage.name)
          setIdentityName(lastMessage.name);
      } else {
        setIdentityName(identities[0]);
      }
    }
  }, [messages, identities, identityName]);
  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!identityName) throw new Error("No identity selected");
    setNewMessageText("");
    await sendMessage({ body: newMessageText, identityName, threadId });
  }
  return (
    <>
      <ul>
        {messages.map((message) => (
          <li key={message._id}>
            <span>{message.name ?? message.author}:</span>
            <span style={{ whiteSpace: "pre-wrap" }}>
              {message.error ? "⚠️ " + message.error : message.body ?? "..."}
            </span>
            <span>
              {new Date(
                message.updatedAt ?? message._creationTime
              ).toLocaleTimeString()}
            </span>
          </li>
        ))}
        {messages.length === 0 ? <li>New thread...</li> : null}
      </ul>
      <form onSubmit={handleSendMessage}>
        <select
          value={identityName}
          onChange={(e) => setIdentityName(e.target.value)}
        >
          {identities?.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <input
          value={newMessageText}
          onChange={(event) => setNewMessageText(event.target.value)}
          placeholder="Write a message…"
        />
        <input type="submit" value="Send" disabled={!newMessageText} />
      </form>
    </>
  );
}
