import { useState, useRef, useEffect, useCallback } from "react";
import { fetchResources } from "@/lib/api";
import { SearchForm, type SearchFormData } from "@/components/SearchForm";
import { AIResponseCard } from "@/components/AIResponseCard";
import { GuidanceCard } from "@/components/GuidanceCard";
import { SavedResourcesPanel } from "@/components/SavedResourcesPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useSavedResources } from "@/hooks/useSavedResources";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AIResponse, Resource, ChatMessage } from "@/types/resources";

let msgId = 0;
const nextId = () => `msg-${++msgId}`;

const Index = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const { saved, saveResource, removeResource, isSaved } = useSavedResources();
  const { dark, toggle: toggleTheme } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchFormRef = useRef<{ setSituation: (v: string) => void } | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSubmit = async (formData: SearchFormData) => {
    const locationLabel = formData.state
      ? formData.city ? `${formData.city}, ${formData.state}` : formData.state
      : null;
    const userMsg: ChatMessage = {
      id: nextId(),
      role: "user",
      content: formData.situation,
      location: locationLabel,
    };
    const assistantId = nextId();
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", isLoading: true }]);
    setIsLoading(true);

    try {
      const data = await fetchResources({
        situation: formData.situation,
        state: formData.state,
        city: formData.city || undefined,
        category: formData.category || undefined,
        simplifyLanguage: formData.simplifyLanguage,
        urgent: formData.urgent,
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, data, isLoading: false } : m))
      );
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = (resource: Resource, situationSummary: string) => {
    if (isSaved(resource.name, resource.link || "")) {
      removeResource(resource.name, resource.link || "");
      toast.info("Resource removed");
    } else {
      saveResource(resource, situationSummary);
      toast.success("Resource saved");
    }
  };

  const handleSuggestedPromptClick = (prompt: string) => {
    searchFormRef.current?.setSituation(prompt);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground tracking-tight">ResourceBridge</h1>
            <p className="text-xs text-muted-foreground font-heading">Find support resources tailored to your situation.</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 relative"
              onClick={() => setSavedOpen(true)}
              aria-label="Open saved resources"
            >
              <Bookmark className="size-4" />
              {saved.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-heading font-bold flex items-center justify-center">
                  {saved.length}
                </span>
              )}
            </Button>
            <ThemeToggle dark={dark} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-8">
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 animate-fade-in">
              <div className="text-center space-y-3 max-w-md">
                <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                  How can we help?
                </h2>
                <p className="font-body text-muted-foreground text-base leading-relaxed">
                  Describe your situation and we'll find relevant programs, services, and next steps for you.
                </p>
              </div>
            </div>
          )}

          {hasMessages && (
            <div className="space-y-6">
              {messages.map((msg) => {
                if (msg.role === "user") {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[85%] md:max-w-[70%] px-5 py-3 rounded-2xl rounded-br-sm bg-primary text-primary-foreground font-heading text-[15px] leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  );
                }
                if (msg.isLoading) {
                  return (
                    <div key={msg.id} className="flex justify-start">
                      <LoadingSpinner />
                    </div>
                  );
                }
                if (msg.data) {
                  const mode = msg.data.mode;
                  if (mode === "guidance" || mode === "clarification") {
                    return (
                      <div key={msg.id}>
                        <GuidanceCard data={msg.data} onPromptClick={handleSuggestedPromptClick} />
                      </div>
                    );
                  }
                  if (mode === "error") {
                    return (
                      <div key={msg.id}>
                        <GuidanceCard data={msg.data} onPromptClick={handleSuggestedPromptClick} />
                      </div>
                    );
                  }
                  // mode === "resources"
                  return (
                    <div key={msg.id}>
                      <AIResponseCard
                        data={msg.data}
                        isSaved={isSaved}
                        onToggleSave={(r) => handleToggleSave(r, msg.data!.situationSummary || "")}
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-4">
          <SearchForm ref={searchFormRef} onSubmit={handleSubmit} disabled={isLoading} />
        </div>
      </div>

      {/* Saved panel */}
      <SavedResourcesPanel
        saved={saved}
        onRemove={removeResource}
        open={savedOpen}
        onClose={() => setSavedOpen(false)}
      />
    </div>
  );
};

export default Index;
