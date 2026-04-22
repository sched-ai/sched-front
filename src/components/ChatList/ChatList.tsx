import { useMemo, useState } from "react";
import type { Contact } from "../ChatWindow/ChatWindow";

interface ChatListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

export function ChatList({ contacts, selectedContact, onSelectContact }: ChatListProps) {
  const [search, setSearch] = useState("");

  const filteredContacts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return contacts;

    return contacts.filter((contact) => {
      return (
        contact.name.toLowerCase().includes(normalized) ||
        contact.id.toLowerCase().includes(normalized) ||
        contact.lastMessage.toLowerCase().includes(normalized)
      );
    });
  }, [contacts, search]);

  return (
    <div className="w-full md:w-[360px] lg:w-[400px] bg-white border-r border-border flex flex-col">
      <div className="bg-slate-50 p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 font-semibold">Conversas</h2>
          <p className="text-xs text-slate-600 mt-1">Histórico agrupado por usuário</p>
        </div>
        {/* <div className="flex gap-2 text-slate-600">
          <button className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
            <Search className="size-4" />
          </button>
          <button className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
            <MoreVertical className="size-4" />
          </button>
        </div> */}
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
        {filteredContacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`w-full p-4 flex items-center gap-3 transition-colors border-l-2 ${
              selectedContact?.id === contact.id
                ? 'bg-blue-50 border-blue-600'
                : 'bg-white border-transparent hover:bg-slate-50'
            }`}
          >
            <div className="size-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-semibold">
              <span className="text-sm">{contact.avatar}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-start">
                <h3 className="text-slate-900 truncate font-medium">{contact.name}</h3>
                <span className="text-xs text-slate-500">{contact.timestamp}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600 truncate">{contact.lastMessage}</p>
                {contact.unread && (
                  <span className="bg-blue-600 text-white text-xs rounded-full size-5 flex items-center justify-center flex-shrink-0 ml-2">
                    {contact.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}

        {!filteredContacts.length && (
          <div className="p-6 text-center text-sm text-slate-600">
            Nenhuma conversa encontrada
          </div>
        )}
      </div>
    </div>
  );
}
