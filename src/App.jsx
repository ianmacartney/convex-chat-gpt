import React, { useEffect, useState, useMemo } from "react";
import { useMutation, usePaginatedQuery } from "../convex/_generated/react";
import { AddIdentity } from "./components/AddIdentity";
import { Thread } from "./components/Thread";

export default function App() {
  const { loadMore, results, status } = usePaginatedQuery(
    "messages:list",
    {},
    {
      initialNumItems: 100,
    }
  );
  const messages = useMemo(() => results.slice().reverse(), [results]);

  const [newThreadId, setNewThreadId] = useState(null);
  const createThread = useMutation("threads:add");
  useEffect(() => {
    if (newThreadId && messages.find((m) => newThreadId.equals(m.threadId)))
      setNewThreadId(null);
  }, [newThreadId, messages]);

  return (
    <main>
      <h1>Convex Chat-GPT</h1>
      <p>Disclaimer: Any identities here are not real. Just robots.</p>
      {status === "CanLoadMore" && (
        <button onClick={() => loadMore(100)}>Load More</button>
      )}
      {messages
        .reduce((threads, message) => {
          const thread = threads.find(
            (threadMessages) =>
              threadMessages[0].threadId?.toString() ===
              message.threadId?.toString()
          );
          if (thread) {
            thread.push(message);
          } else {
            threads.push([message]);
          }
          return threads;
        }, [])
        .map((messages, index, threads) => (
          <details
            key={"thread" + index}
            open={!newThreadId && index === threads.length - 1}
          >
            <summary>{messages[0]?.body?.substring(0, 100)}...</summary>
            <Thread messages={messages} threadId={messages[0].threadId} />
          </details>
        ))}
      {newThreadId && (
        <>
          <Thread messages={[]} threadId={newThreadId} />
        </>
      )}
      <button
        onClick={(e) => {
          e.preventDefault();
          createThread().then(setNewThreadId);
        }}
        disabled={newThreadId}
      >
        Start New Thread
      </button>
      <AddIdentity />
    </main>
  );
}
