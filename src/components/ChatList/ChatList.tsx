import { useMemo, useState } from "react";
import type { Contact } from "../ChatWindow/ChatWindow";

interface ChatListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

export function ChatList({ contacts, selectedContact, onSelectContact }: ChatListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "bot" | "human">("all");

  const filteredContacts = useMemo(() => {
    let result = contacts;

    if (filter === "bot") {
      result = result.filter((c) => c.isBotActive !== false);
    } else if (filter === "human") {
      result = result.filter((c) => c.isBotActive === false);
    }

    const normalized = search.trim().toLowerCase();
    if (!normalized) return result;

    return result.filter((contact) => {
      return (
        contact.name.toLowerCase().includes(normalized) ||
        contact.id.toLowerCase().includes(normalized) ||
        contact.lastMessage.toLowerCase().includes(normalized)
      );
    });
  }, [contacts, search, filter]);

  return (
    <div className="w-full md:w-[360px] lg:w-[400px] bg-white border-r border-border flex flex-col">
      <div className="bg-slate-50 p-4 border-b border-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 font-semibold">Conversas</h2>
            <p className="text-xs text-slate-600 mt-1">Histórico agrupado por usuário</p>
          </div>
        </div>

        <div className="flex gap-1 bg-slate-200/50 p-1 rounded-lg">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all ${
              filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter("bot")}
            className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all ${
              filter === "bot" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            IA
          </button>
          <button
            onClick={() => setFilter("human")}
            className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all ${
              filter === "human" ? "bg-white text-orange-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Manual
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-border bg-white">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por cliente, telefone ou mensagem"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredContacts.map((contact) => {
          const isManual = contact.isBotActive === false;
          const isActive = selectedContact?.id === contact.id;
          
          return (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`w-full p-4 flex items-center gap-3 transition-colors border-l-2 ${
                isActive
                  ? isManual 
                    ? 'bg-orange-50 border-orange-600'
                    : 'bg-blue-50 border-blue-600'
                  : 'bg-white border-transparent hover:bg-slate-50'
              }`}
            >
              <div className={`size-11 rounded-full flex items-center justify-center flex-shrink-0 font-semibold ${
                isManual ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <span className="text-sm">{contact.avatar}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-start">
                  <h3 className="text-slate-900 truncate font-medium">{contact.name}</h3>
                  <span className="text-xs text-slate-500">{contact.timestamp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600 truncate">{contact.lastMessage}</p>
                  <div className="flex items-center gap-2">
                    {isManual && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-700 uppercase">
                        Manual
                      </span>
                    )}
                    {contact.unread && (
                      <span className={`${isManual ? 'bg-orange-600' : 'bg-blue-600'} text-white text-[10px] rounded-full size-4 flex items-center justify-center flex-shrink-0`}>
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {!filteredContacts.length && (
          <div className="p-6 text-center text-sm text-slate-600">
            Nenhuma conversa encontrada
          </div>
        )}
      </div>
    </div>
  );
}
