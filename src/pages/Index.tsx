import { useState, useRef, useEffect, useCallback } from "react";
import { streamChat, type Msg } from "@/lib/stream-chat";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { CategoryButtons } from "@/components/CategoryButtons";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { Languages } from "lucide-react";

interface ChatMsg extends Msg {
  id: string;
  bookmarked?: boolean;
}

let msgId = 0;
const nextId = () => `msg-${++msgId}`;

const Index = () => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [simplify, setSimplify] = useState(false);
  const [latestAssistantId, setLatestAssistantId] = useState<string | null>(null);
  const [focusRestored, setFocusRestored] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const sendMessage = async (input: string) => {
    const userMsg: ChatMsg = { id: nextId(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setFocusRestored(false);

    let assistantSoFar = "";
    const assistantId = nextId();

    const allMessages = [...messages.map(({ role, content }) => ({ role, content })), { role: "user" as const, content: input }];

    try {
      await streamChat({
        messages: allMessages,
        location: location || undefined,
        simplify,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.id === assistantId) {
              return prev.map((m) => (m.id === assistantId ? { ...m, content: assistantSoFar } : m));
            }
            return [...prev, { id: assistantId, role: "assistant", content: assistantSoFar }];
          });
        },
        onDone: () => {
          setIsLoading(false);
          setLatestAssistantId(assistantId);
        },
        onError: (error) => {
          setIsLoading(false);
          toast.error(error);
        },
      });
    } catch {
      setIsLoading(false);
      toast.error("Connection error. Please try again.");
    }
  };

  const toggleBookmark = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, bookmarked: !m.bookmarked } : m))
    );
    const msg = messages.find((m) => m.id === id);
    if (msg && !msg.bookmarked) {
      toast.success("Response saved");
    }
  };

  const hasMessages = messages.length > 0;
  const shouldFade = latestAssistantId && !focusRestored;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-heading font-bold text-xl text-foreground tracking-tight">
            ResourceBridge
          </h1>
          <button
            onClick={() => {
              setSimplify(!simplify);
              toast.info(simplify ? "Standard language enabled" : "Simplified language enabled");
            }}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors font-heading ${
              simplify
                ? "border-primary text-primary bg-primary/5"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle simplified language"
          >
            <Languages className="size-3.5" />
            {simplify ? "Simple" : "Simplify"}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-8">
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-fade-in">
              <div className="text-center space-y-3 max-w-md">
                <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                  How can we help?
                </h2>
                <p className="font-body text-muted-foreground text-base leading-relaxed">
                  Describe your situation and we'll find relevant programs, services, and next steps for you.
                </p>
              </div>
              <CategoryButtons onSelect={sendMessage} disabled={isLoading} />
            </div>
          )}

          {hasMessages && (
            <div className="space-y-5">
              {messages.map((msg) => {
                const isFaded = shouldFade && msg.id !== latestAssistantId;
                return (
                  <ChatMessage
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    faded={isFaded}
                    isBookmarked={msg.bookmarked}
                    onToggleBookmark={msg.role === "assistant" ? () => toggleBookmark(msg.id) : undefined}
                    onRestoreFocus={() => setFocusRestored(true)}
                  />
                );
              })}
              {isLoading && <LoadingSpinner />}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-4">
          <ChatInput
            onSend={sendMessage}
            location={location}
            onLocationChange={setLocation}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
