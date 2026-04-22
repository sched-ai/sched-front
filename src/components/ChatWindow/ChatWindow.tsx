import { MessageSquareText, ChevronDown, Send, Loader2 } from "lucide-react";
import { formatBusinessHour } from "@/lib/dateTime";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[];
  onLoadOlderMessages: () => void;
  hasMoreMessages: boolean;
  isLoadingMessages?: boolean;
  isLoadingOlderMessages?: boolean;
  onSendMessage?: (text: string) => void;
  isSending?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  subtitle?: string;
}

export interface Message {
  id: number;
  text: string;
  timestamp: string;
  sent: boolean;
  sessionId?: string;
}

const formatMessageTime = (value: string) => {
  return formatBusinessHour(value, "Sem horário");
};

const toDateKey = (value: string) => {
  if (!value || value === "Sem horário") return "sem-data";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "sem-data";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateBadge = (value: string) => {
  if (value === "sem-data") return "Sem data";

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (value === todayKey) return "HOJE";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

export function ChatWindow({
  contact,
  messages,
  onLoadOlderMessages,
  hasMoreMessages,
  isLoadingMessages,
  isLoadingOlderMessages,
  onSendMessage,
  isSending,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [isReady, setIsReady] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const previousScrollHeightRef = useRef(0);
  const previousScrollTopRef = useRef(0);
  const shouldPreserveScrollRef = useRef(false);
  const loadLockRef = useRef(false);
  const lastContactIdRef = useRef<string | null>(null);
  const didScrollToBottomOnContactRef = useRef(false);
  
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isAtBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);

  const messagesWithDate = useMemo(() => {
    return messages.map((message) => ({
      ...message,
      dateKey: toDateKey(message.timestamp),
    }));
  }, [messages]);

  const handleScroll = () => {
    const element = scrollContainerRef.current;
    if (!element) return;

    const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 50;
    isAtBottomRef.current = atBottom;

    if (atBottom && showScrollButton) {
      setShowScrollButton(false);
    }

    if (
      element.scrollTop <= 16 &&
      hasMoreMessages &&
      !isLoadingMessages &&
      !isLoadingOlderMessages &&
      !loadLockRef.current
    ) {
      previousScrollHeightRef.current = element.scrollHeight;
      previousScrollTopRef.current = element.scrollTop;
      shouldPreserveScrollRef.current = true;
      loadLockRef.current = true;

      Promise.resolve(onLoadOlderMessages()).finally(() => {
        loadLockRef.current = false;
      });
    }
  };

  useEffect(() => {
    const currentContactId = contact?.id || null;

    if (currentContactId !== lastContactIdRef.current) {
      lastContactIdRef.current = currentContactId;
      didScrollToBottomOnContactRef.current = false;
      shouldPreserveScrollRef.current = false;
      setShowScrollButton(false);
      prevMessagesLengthRef.current = 0;
      isAtBottomRef.current = true;
      setIsReady(false);
    }
  }, [contact?.id]);

  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) return;

    if (shouldPreserveScrollRef.current) {
      const newScrollHeight = element.scrollHeight;
      const delta = newScrollHeight - previousScrollHeightRef.current;
      element.scrollTop = previousScrollTopRef.current + delta;
      shouldPreserveScrollRef.current = false;
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    if (!didScrollToBottomOnContactRef.current && !isLoadingMessages) {
      if (messages.length > 0) {
        element.scrollTop = element.scrollHeight;
      }
      didScrollToBottomOnContactRef.current = true;
      prevMessagesLengthRef.current = messages.length;
      isAtBottomRef.current = true;
      setIsReady(true);
      return;
    }

    if (messages.length > prevMessagesLengthRef.current && didScrollToBottomOnContactRef.current && !isLoadingMessages) {
      if (isAtBottomRef.current) {
        element.scrollTop = element.scrollHeight;
      } else {
        setShowScrollButton(true);
      }
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, isLoadingMessages]);

  const scrollToBottom = () => {
    const element = scrollContainerRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
    setShowScrollButton(false);
  };

  if (!contact) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center text-slate-600">
          <div className="size-14 mx-auto mb-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
            <MessageSquareText className="size-7" />
          </div>
          <p className="text-sm">Selecione uma conversa para visualizar as mensagens.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative bg-slate-50 h-full">
      {/* Header updates instantly without animation for a snappier feel */}
      <div className="bg-white p-4 flex items-center gap-3 border-b border-border">
        <div className="size-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
          <span className="text-sm">{contact.avatar}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-slate-900 font-semibold truncate">{contact.name}</h2>
          <p className="text-xs text-slate-600 truncate mt-1">{contact.subtitle || `Cliente: ${contact.id}`}</p>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-slate-50 custom-scrollbar"
      >
        <div className={`space-y-3 transition-opacity duration-300 ${(isReady || isLoadingMessages) ? "opacity-100" : "opacity-0"}`}>
          {isLoadingOlderMessages && messages.length > 0 && (
            <div className="text-xs text-slate-500 text-center py-2">Carregando mensagens anteriores...</div>
          )}

          {isLoadingMessages && (
            <div className="space-y-6 py-6 w-full flex flex-col px-2">
              <div className="flex items-center justify-center">
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              
              <div className="flex justify-start">
                <div className="flex flex-col gap-2 max-w-[80%]">
                  <Skeleton className="h-16 w-[280px] rounded-2xl rounded-tl-sm" />
                  <Skeleton className="h-12 w-[220px] rounded-2xl rounded-tl-sm" />
                </div>
              </div>

              <div className="flex justify-end">
                <Skeleton className="h-14 w-[240px] rounded-2xl rounded-tr-sm" />
              </div>

              <div className="flex justify-start">
                <Skeleton className="h-20 w-[300px] rounded-2xl rounded-tl-sm" />
              </div>
            </div>
          )}

          {!isLoadingMessages && !messages.length && (
            <div className="text-sm text-slate-600 text-center py-8">
              Nenhuma mensagem disponível para este contato.
            </div>
          )}

          {!isLoadingMessages && messagesWithDate.map((message, index) => {
            const previousMessage = messagesWithDate[index - 1];
            const hasDateChange = !previousMessage || previousMessage.dateKey !== message.dateKey;

            return (
              <Fragment key={`${message.sessionId || "session"}-${message.id}`}>
                {hasDateChange && (
                  <div className="flex items-center justify-center py-2">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
                      {formatDateBadge(message.dateKey)}
                    </span>
                  </div>
                )}

                <div className={`flex ${message.sent ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-md px-3 py-2 rounded-lg border shadow-sm ${
                      message.sent
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    <span
                      className={`text-xs float-right ml-2 mt-1 ${
                        message.sent ? "text-blue-100" : "text-slate-500"
                      }`}
                    >
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 z-10"
          title="Novas mensagens"
        >
          <ChevronDown className="size-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border-2 border-white"></span>
          </span>
        </button>
      )}

      <div className="bg-white p-4 border-t border-border">
        {onSendMessage ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim() && !isSending) {
                onSendMessage(inputText.trim());
                setInputText("");
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isSending}
              className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="flex items-center justify-center p-2 rounded-full bg-blue-600 text-white disabled:opacity-50 disabled:hover:bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {isSending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
            </button>
          </form>
        ) : (
          <div className="text-sm text-slate-600">
            Modo monitoramento: visualização somente leitura das mensagens do chat.
          </div>
        )}
      </div>
    </div>
  );
}
