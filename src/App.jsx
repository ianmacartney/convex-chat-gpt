import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "../convex/_generated/react";

function AddIdentity() {
  const addIdentity = useMutation("identity:add");
  const [newIdentityName, setNewIdentityName] = useState("");
  const [newIdentityInstructions, setNewIdentityInstructions] = useState("");

  return (
    <section>
      <details open={false}>
        <summary>Add an identity</summary>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await addIdentity(newIdentityName, newIdentityInstructions);
            setNewIdentityName("");
            setNewIdentityInstructions("");
          }}
        >
          <input
            value={newIdentityName}
            onChange={(event) => setNewIdentityName(event.target.value)}
            placeholder="Identity Name"
          />
          <textarea
            value={newIdentityInstructions}
            onChange={(event) => setNewIdentityInstructions(event.target.value)}
            placeholder="GPT3 Instructions"
            rows={2}
            cols={40}
          />
          <input
            type="submit"
            value="Add Identity"
            disabled={!newIdentityName || !newIdentityInstructions}
          />
        </form>
      </details>
    </section>
  );
}

export default function App() {
  const identities = useQuery("identity:list") || [];
  const [identityName, setIdentityName] = useState();
  useEffect(() => {
    if (identities.length && !identityName) {
      setIdentityName(identities[0]);
    }
  }, [identities]);

  const messages = useQuery("messages:list") || [];
  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation("messages:send");

  const latestThread = useQuery("threads:latest") || null;
  const newThread = useMutation("threads:add");
  const newThreadPending = !latestThread?._id.equals(
    messages[messages.length - 1]?.threadId
  );

  async function handleSendMessage(event) {
    event.preventDefault();
    setNewMessageText("");
    await sendMessage(newMessageText, identityName, latestThread?._id);
  }
  return (
    <main>
      <h1>Convex Chat-GPT</h1>
      {messages
        .reduce((threads, message) => {
          if (threads.length === 0) {
            return [[message]];
          }
          const end = threads.length - 1;
          if (
            threads[end][0].threadId?.toString() ===
            message.threadId?.toString()
          ) {
            threads[end].push(message);
          } else {
            threads.push([message]);
          }
          return threads;
        }, [])
        .map((threadMessages, index, threads) => (
          <details key={"thread" + index} open={index === threads.length - 1}>
            <summary>{threadMessages[0]?.body}</summary>
            <ul>
              {threadMessages.map((message) => (
                <li key={message._id.toString()}>
                  <span>{message.identityName ?? message.author}:</span>
                  <span>
                    {message.error ? (
                      <>⚠️{message.error}</>
                    ) : (
                      message.body?.split("\n").map((line, i) => (
                        <React.Fragment key={line + i}>
                          {i ? <br /> : null}
                          {line}
                        </React.Fragment>
                      )) ?? "..."
                    )}
                  </span>
                  <span>
                    {new Date(
                      message.updatedAt ?? message._creationTime
                    ).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      {newThreadPending && (
        <ul>
          <li>...</li>
        </ul>
      )}
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
        <input type="submit" value="Send" disabled={!newMessageText} />
        <button
          onClick={(e) => {
            e.preventDefault();
            newThread();
          }}
          disabled={latestThread && newThreadPending}
        >
          New Thread
        </button>
      </form>
      <AddIdentity />
    </main>
  );
}
