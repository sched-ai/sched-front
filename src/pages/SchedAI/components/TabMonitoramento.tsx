import { ChatList } from "@/components/ChatList/ChatList"
import { ChatWindow, type Contact } from "@/components/ChatWindow/ChatWindow"
import {
  useGetMonitoringSessionMessages,
  useGetMonitoringUserSessions,
  useGetMonitoringUsers,
} from "@/hooks/api/useSchedAiMonitoring"
import { formatBusinessHour } from "@/lib/dateTime"
import { MessageSquareText } from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"

const toAvatarLabel = (name: string) => {
  const words = name.split(" ").filter(Boolean)
  if (!words.length) return "CH"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

const formatListTimestamp = (value: string | null) => {
  return formatBusinessHour(value, "Sem horário")
}

export function TabMonitoramento({ headerAction }: { headerAction?: ReactNode } = {}) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [messagesPage, setMessagesPage] = useState(1)

  const usersQuery = useGetMonitoringUsers({ page: 1, limit: 200 })

  const contacts = useMemo(() => {
    const users = usersQuery.data?.data || []

    return users.map((user): Contact => ({
      id: user.clientPhone,
      name: user.clientName,
      avatar: toAvatarLabel(user.clientName),
      lastMessage: user.latestMessage || "Sem mensagens",
      timestamp: formatListTimestamp(user.latestTimestamp),
      subtitle: `${user.clientPhone} • ${user.totalSessions} sessões`,
    }))
  }, [usersQuery.data])

  const sessionsQuery = useGetMonitoringUserSessions({
    clientPhone: selectedContact?.id,
    page: 1,
    limit: 120,
    enabled: Boolean(selectedContact?.id),
  })

  const sessions = useMemo(() => {
    return (sessionsQuery.data?.data || []).map((session) => ({
      sessionId: session.sessionId,
      dateLabel: session.dateLabel,
      totalMessages: session.totalMessages,
    }))
  }, [sessionsQuery.data])

  const messagesQuery = useGetMonitoringSessionMessages({
    sessionId: selectedSessionId || undefined,
    page: messagesPage,
    limit: 30,
    enabled: Boolean(selectedSessionId),
  })

  const messages = useMemo(() => {
    return (messagesQuery.data?.data || []).map((message) => ({
      id: message.id,
      text: message.text,
      timestamp: message.timestamp || "Sem horário",
      sent: message.sent,
    }))
  }, [messagesQuery.data])

  useEffect(() => {
    if (!contacts.length) {
      setSelectedContact(null)
      return
    }

    const selectedStillExists = selectedContact
      ? contacts.some((contact) => contact.id === selectedContact.id)
      : false

    if (!selectedContact || !selectedStillExists) {
      setSelectedContact(contacts[0])
    }
  }, [contacts, selectedContact])

  useEffect(() => {
    setSelectedSessionId(null)
    setMessagesPage(1)
  }, [selectedContact?.id])

  useEffect(() => {
    if (!sessions.length) {
      setSelectedSessionId(null)
      return
    }

    const sessionStillExists = selectedSessionId
      ? sessions.some((session) => session.sessionId === selectedSessionId)
      : false

    if (!selectedSessionId || !sessionStillExists) {
      setSelectedSessionId(sessions[0].sessionId)
      setMessagesPage(1)
    }
  }, [sessions, selectedSessionId])

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    setMessagesPage(1)
  }

  const handleMessagesPageChange = (page: number) => {
    const totalPages = messagesQuery.data?.meta.totalPages || 1
    if (page < 1 || page > totalPages) return
    setMessagesPage(page)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <MessageSquareText className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Monitoramento de Conversas</h3>
              <p className="text-sm text-muted-foreground">
                Conversas agrupadas por usuário, com sessões por dia e paginação de 30 mensagens.
              </p>
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>

        <div className="h-[calc(80vh)] min-h-[560px] w-full rounded-lg border border-slate-200 overflow-hidden">
          {usersQuery.isLoading ? (
            <div className="size-full bg-slate-50 flex items-center justify-center text-sm text-slate-600">
              Carregando usuários do monitoramento...
            </div>
          ) : (
          <div className="size-full flex bg-background">
            <ChatList
              contacts={contacts}
              selectedContact={selectedContact}
              onSelectContact={setSelectedContact}
            />
            <ChatWindow
              contact={selectedContact}
              messages={messages}
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              onSelectSession={handleSelectSession}
              messagesPage={messagesPage}
              totalMessagePages={messagesQuery.data?.meta.totalPages || 1}
              onMessagesPageChange={handleMessagesPageChange}
              isLoadingSessions={sessionsQuery.isLoading}
              isLoadingMessages={messagesQuery.isLoading}
            />
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
