import { MessageSquareText, Search, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { formatBusinessHour } from "@/lib/dateTime";

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[];
  sessions: SessionSummary[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  messagesPage: number;
  totalMessagePages: number;
  onMessagesPageChange: (page: number) => void;
  isLoadingSessions?: boolean;
  isLoadingMessages?: boolean;
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
}

export interface SessionSummary {
  sessionId: string;
  dateLabel: string;
  totalMessages: number;
}

const formatMessageTime = (value: string) => {
  return formatBusinessHour(value, "Sem horário");
};

export function ChatWindow({
  contact,
  messages,
  sessions,
  selectedSessionId,
  onSelectSession,
  messagesPage,
  totalMessagePages,
  onMessagesPageChange,
  isLoadingSessions,
  isLoadingMessages,
}: ChatWindowProps) {
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
    <div className="flex-1 flex flex-col">
      <div className="bg-white p-4 flex items-center gap-3 border-b border-border">
        <div className="size-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
          <span className="text-sm">{contact.avatar}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-slate-900 font-semibold truncate">{contact.name}</h2>
          <p className="text-xs text-slate-600 truncate">{contact.subtitle || `Cliente: ${contact.id}`}</p>
        </div>
        <div className="flex gap-2 text-slate-600">
          <button className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
            <Search className="size-4" />
          </button>
          <button className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-border bg-white flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Sessão (dia)</label>
        <select
          value={selectedSessionId || ""}
          onChange={(event) => onSelectSession(event.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          disabled={!sessions.length || isLoadingSessions}
        >
          {!sessions.length ? (
            <option value="">Nenhuma sessão encontrada</option>
          ) : (
            sessions.map((session) => (
              <option key={session.sessionId} value={session.sessionId}>
                {session.dateLabel} • {session.totalMessages} mensagens
              </option>
            ))
          )}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-3">
          {isLoadingMessages && (
            <div className="text-sm text-slate-600 text-center py-8">Carregando mensagens...</div>
          )}

          {!isLoadingMessages && !messages.length && (
            <div className="text-sm text-slate-600 text-center py-8">
              Nenhuma mensagem para a sessão selecionada.
            </div>
          )}

          {!isLoadingMessages && messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-3 py-2 rounded-lg border shadow-sm ${
                  message.sent
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                <span
                  className={`text-xs float-right ml-2 mt-1 ${
                    message.sent ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  {formatMessageTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 border-t border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            Modo monitoramento: visualização somente leitura das mensagens do chat.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onMessagesPageChange(messagesPage - 1)}
              disabled={messagesPage <= 1}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs text-slate-600 min-w-[78px] text-center">
              Página {messagesPage} de {Math.max(totalMessagePages, 1)}
            </span>
            <button
              type="button"
              onClick={() => onMessagesPageChange(messagesPage + 1)}
              disabled={messagesPage >= Math.max(totalMessagePages, 1)}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
