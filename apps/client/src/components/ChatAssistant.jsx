import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { API_URL } from "../config/api";

const MAX_INPUT_LENGTH = 500;
const aiBaseUrl = API_URL ? `${API_URL}/ai` : "/ai";

const SAFE_ROUTE_PATTERNS = [
  /^\/$/,
  /^\/home$/,
  /^\/login$/,
  /^\/register$/,
  /^\/cart$/,
  /^\/orders$/,
  /^\/order\/[\w-]+$/,
  /^\/order-summary\/[\w-]+$/,
  /^\/order-list$/,
  /^\/menu-details\/[\w-]+$/,
  /^\/restaurant\/[\w-]+\/menu$/,
  /^\/my-menu$/,
  /^\/my-menu\/[\w-]+\/details$/,
  /^\/manage-restaurant$/,
  /^\/update-menu$/,
  /^\/restaurant-dashboard$/,
  /^\/chat$/,
  /^\/chat\/[\w-]+$/,
  /^\/profile$/,
  /^\/become-seller$/,
  /^\/thanks$/,
  /^\/pay-now\/[\w-]+$/,
  /^\/about$/,
];

const resolveTargetRoute = (route) => {
  if (!route) {
    return null;
  }

  const normalized = route.trim();
  return SAFE_ROUTE_PATTERNS.some((pattern) => pattern.test(normalized))
    ? normalized
    : null;
};

const buildRoleContext = (role) => {
  if (role === "seller") {
    return "User role: seller. Prefer seller-facing routes such as /order-list, /my-menu, /my-menu/:id/details, /manage-restaurant, /restaurant-dashboard, /chat.";
  }
  if (role === "user" || role === "customer") {
    return "User role: buyer. Prefer buyer routes such as /orders, /order-summary/:id, /cart, /menu-details/:id, /chat.";
  }
  return "User role: unknown. Ask which page they need if unsure.";
};

const parseAssistantReply = (text) => {
  if (!text) {
    return { cleanedText: "", target: null };
  }

  const match = text.match(/GOTO:\s*(\S+)/);
  const cleanedText = match
    ? text.replace(/GOTO:\s*\S+/g, "").trim()
    : text.trim();

  const target = match ? resolveTargetRoute(match[1]) : null;

  return { cleanedText, target };
};

const ChatAssistant = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const userRole = user?.role;

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey there! I'm Fae, your FastEats guide. What would you like to do next?",
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
    const displayMessages = [...messages, userMessage];

    setMessages([...displayMessages, { role: "assistant", content: "" }]);
    setInputValue("");

    const contextMessages = userRole
      ? [{ role: "system", content: buildRoleContext(userRole) }]
      : [];
    const requestMessages = [...contextMessages, ...displayMessages];

    try {
      const response = await fetch(`${aiBaseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: requestMessages }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      const assistantReply = typeof data.reply === "string" ? data.reply : "";
      const { cleanedText, target } = parseAssistantReply(assistantReply);
      const finalContent =
        cleanedText || "I'm not sure what to say. Could you rephrase that?";

      setMessages([...displayMessages, { role: "assistant", content: finalContent }]);

      if (target) {
        setTimeout(() => navigate(target), 120);
      }
    } catch (err) {
      console.error("ChatAssistant error", err);
      setMessages(displayMessages);
      setError("Sorry, the assistant is unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 sm:bottom-10 right-4 sm:right-8 z-50 w-[calc(100%-2rem)] sm:w-96 max-w-md">
      <div className="flex flex-col h-[28rem] rounded-3xl shadow-2xl border border-yellow-200 bg-white/95 backdrop-blur">
        <header className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Fae - FastEats AI</p>
            <p className="text-xs text-white/90">Smart pointers and speedy navigation</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs font-medium bg-white/15 rounded-full hover:bg-white/25 transition"
          >
            Close
          </button>
        </header>

        <div
          ref={listRef}
          className="flex-1 bg-yellow-50/60 px-4 py-3 overflow-y-auto space-y-3 text-sm"
        >
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-yellow-500 text-white shadow-md"
                      : "bg-white border border-yellow-200 text-slate-800"
                  }`}
                >
                  {message.content || (message.role === "assistant" ? "..." : null)}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="text-xs text-yellow-600 animate-pulse">Fae is thinking...</div>
          )}
        </div>

        {error && (
          <div className="px-4 py-2 text-sm text-red-600 bg-red-50 border-t border-red-100">
            {error}
          </div>
        )}

        <form
          onSubmit={sendMessage}
          className="border-t border-yellow-200 bg-white px-4 py-3 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              if (error) {
                setError("");
              }
            }}
            placeholder="Ask Fae to guide you..."
            className="flex-1 rounded-full border border-yellow-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full bg-yellow-500 text-white text-sm font-semibold px-4 py-2 shadow-sm hover:bg-yellow-600 transition disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAssistant;
