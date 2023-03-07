import React, { useEffect, useState } from "react";
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
  SignIn,
  useAuth,
} from "@clerk/clerk-react";
import { useMutation, useQuery } from "../convex/_generated/react";

function OrSignIn({ children }) {
  const [signingIn, setSigningIn] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  return isLoaded && !isSignedIn && signingIn ? (
    <RedirectToSignIn />
  ) : (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <button
          onClick={(e) => {
            e.preventDefault();
            setSigningIn(true);
          }}
          disabled={!isLoaded}
        >
          Sign In
        </button>
      </SignedOut>
    </>
  );
}

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
          <OrSignIn>
            <input
              type="submit"
              value="Add Identity"
              disabled={!newIdentityName || !newIdentityInstructions}
            />
          </OrSignIn>
        </form>
      </details>
    </section>
  );
}

function Thread({ threadId, messages }) {
  const identities = useQuery("identity:list") || [];
  const [identityName, setIdentityName] = useState();
  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation("messages:send");
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
        </OrSignIn>
      </form>
    </>
  );
}

export default function App() {
  const messages = useQuery("messages:list") || [];

  const latestThread = useQuery("threads:latest") || null;
  const newThread = useMutation("threads:add");
  const newThreadPending =
    latestThread &&
    !latestThread?._id.equals(messages[messages.length - 1]?.threadId);

  return (
    <main>
      <h1>Convex Chat-GPT</h1>
      <UserButton />
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
          <details key={"thread" + index} open={index === threads.length - 1}>
            <summary>{messages[0]?.body}</summary>
            <Thread messages={messages} threadId={messages[0].threadId} />
          </details>
        ))}
      {newThreadPending && (
        <>
          <Thread messages={[]} threadId={latestThread?._id} />
        </>
      )}
      <OrSignIn>
        <button
          onClick={(e) => {
            e.preventDefault();
            newThread();
          }}
          disabled={newThreadPending}
        >
          Start New Thread
        </button>
      </OrSignIn>
      <AddIdentity />
    </main>
  );
}
