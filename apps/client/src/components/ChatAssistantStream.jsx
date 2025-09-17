import { useEffect, useRef, useState } from "react";
import { API_URL } from "../config/api";

const MAX_INPUT_LENGTH = 500;
const aiBaseUrl = API_URL ? `${API_URL}/api/ai` : "/api/ai";

const ChatAssistantStream = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I can help you navigate the app or find features. What do you need?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (event) => {
    event?.preventDefault();
    const trimmed = inputValue.trim();

    if (!trimmed) {
      return;
    }

    if (trimmed.length > MAX_INPUT_LENGTH) {
      setError(`Please keep messages under ${MAX_INPUT_LENGTH} characters.`);
      return;
    }

    setError("");
    setIsLoading(true);

    const userMessage = { role: "user", content: trimmed };
    const baseMessages = [...messages, userMessage];

    setMessages([...baseMessages, { role: "assistant", content: "" }]);
    setInputValue("");

    try {
      const response = await fetch(`${aiBaseUrl}/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ messages: baseMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Streaming request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let assistantBuffer = "";
      let done = false;

      const updateAssistant = (text) => {
        setMessages([...baseMessages, { role: "assistant", content: text }]);
      };

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (readerDone) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const rawEvent of events) {
          if (!rawEvent.trim() || rawEvent.startsWith(":")) {
            continue;
          }

          const lines = rawEvent.split("\n");
          let eventType = "message";
          const dataLines = [];

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trim());
            }
          }

          if (eventType === "done") {
            done = true;
            break;
          }

          const chunk = dataLines.join("\n");
          if (!chunk || chunk === "end") {
            done = true;
            break;
          }

          assistantBuffer += chunk;
          updateAssistant(assistantBuffer);
        }
      }
    } catch (err) {
      console.error("ChatAssistantStream error", err);
      setMessages(baseMessages);
      setError("Sorry, the assistant is unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 sm:bottom-20 right-4 left-4 sm:left-auto sm:w-96 w-auto z-50">
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[26rem]">
        <header className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
          <span className="font-semibold">AI Assistant (Stream)</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm bg-white/10 hover:bg-white/20"
          >
            Close
          </button>
        </header>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50 text-sm">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-2xl px-3 py-2 max-w-[85%] whitespace-pre-wrap break-words ${
                  message.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-900 border border-slate-200"
                }`}
              >
                {message.content || (message.role === "assistant" ? "..." : null)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-xs text-slate-500 italic">Assistant is responding...</div>
          )}
        </div>

        {error && (
          <div className="px-4 py-2 text-sm text-red-600 bg-red-50 border-t border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white px-3 py-2 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              if (error) {
                setError("");
              }
            }}
            placeholder="Ask something about the app..."
            className="flex-1 border border-slate-200 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-full disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAssistantStream;