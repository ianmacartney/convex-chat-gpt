import React, { useEffect, useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import { useAction, useQuery } from "../../convex/_generated/react";
import { OrSignIn } from "./OrSignIn";

export function Thread({ threadId, messages }) {
  const identities = useQuery("identity:list") || [];
  const [identityName, setIdentityName] = useState();
  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useAction("actions/openai:chat");
  useEffect(() => {
    if (identities.length && !identityName) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && identities.indexOf(lastMessage.identityName) !== -1) {
        setIdentityName(lastMessage.identityName);
      } else {
        setIdentityName(identities[0]);
      }
    }
  }, [messages, identities]);
  async function handleSendMessage(event) {
    event.preventDefault();
    setNewMessageText("");
    await sendMessage(newMessageText, identityName, threadId);
  }
  return (
    <>
      <ul>
        {messages.map((message) => (
          <li key={message._id.toString()}>
            <span>{message.identityName ?? message.author}:</span>
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
          {identities.map((name) => (
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
        <OrSignIn>
          <input type="submit" value="Send" disabled={!newMessageText} />
          <UserButton />
        </OrSignIn>
      </form>
    </>
  );
}
