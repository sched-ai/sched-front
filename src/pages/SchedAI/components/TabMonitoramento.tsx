import { ChatList } from "@/components/ChatList/ChatList"
import { ChatWindow, type Contact, type Message } from "@/components/ChatWindow/ChatWindow"
import {
  useGetMonitoringSessionMessages,
  useGetMonitoringUserSessions,
  useGetMonitoringUsers,
  useSendMonitoringMessage,
} from "@/hooks/api/useSchedAiMonitoring"
import { formatBusinessHour } from "@/lib/dateTime"
import { formatPhone } from "@/util/helper"
import { BotMessageSquare } from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { StorageService } from "@/services"

const toAvatarLabel = (name: string) => {
  const words = name.split(" ").filter(Boolean)
  if (!words.length) return "CH"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

const formatListTimestamp = (value: string | null) => {
  return formatBusinessHour(value, "Sem horário")
}

const mergeOlderMessages = (older: Message[], newer: Message[]) => {
  const seen = new Set<string>()
  const merged: Message[] = []

  for (const message of [...older, ...newer]) {
    const key = `${message.sessionId || ""}-${message.id}`
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(message)
  }

  return merged.sort((a, b) => a.id - b.id)
}

export function TabMonitoramento({ headerAction }: { headerAction?: ReactNode } = {}) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [sessionCursor, setSessionCursor] = useState(0)
  const [sessionPage, setSessionPage] = useState(1)
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([])
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [hasNextPageInSession, setHasNextPageInSession] = useState(false)

  const { mutateAsync: sendMessage, isPending: isSending } = useSendMonitoringMessage()

  const queryClient = useQueryClient()

  useEffect(() => {
    const token = StorageService.getToken()
    const baseUrl = import.meta.env.VITE_APP_API_URL

    if (!token || !baseUrl) return

    const eventSource = new EventSource(`${baseUrl}/sched-ai/monitoring/stream?token=${token}`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "update") {
          queryClient.invalidateQueries({ queryKey: ["sched-ai-monitoring-users"] })
          queryClient.invalidateQueries({ queryKey: ["sched-ai-monitoring-sessions"] })
          queryClient.invalidateQueries({ queryKey: ["sched-ai-monitoring-messages"] })
        }
      } catch (e) {
        // ignora possíveis erros de parse do ping
      }
    }

    eventSource.onerror = () => {
      // O EventSource tentará se reconectar automaticamente
    }

    return () => {
      eventSource.close()
    }
  }, [queryClient])

  const usersQuery = useGetMonitoringUsers({ page: 1, limit: 200 })

  const contacts = useMemo(() => {
    const users = usersQuery.data?.data || []

    return users.map((user): Contact => ({
      id: user.clientPhone,
      name: user.clientName,
      avatar: toAvatarLabel(user.clientName),
      lastMessage: user.latestMessage || "Sem mensagens",
      timestamp: formatListTimestamp(user.latestTimestamp),
      subtitle: formatPhone(user.clientPhone),
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

  const activeSessionId = sessions[sessionCursor]?.sessionId

  const messagesQuery = useGetMonitoringSessionMessages({
    sessionId: activeSessionId,
    page: sessionPage,
    limit: 30,
    enabled: Boolean(selectedContact?.id && activeSessionId),
  })

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
    setSessionCursor(0)
    setSessionPage(1)
    setLoadedMessages([])
    setHasMoreMessages(true)
    setHasNextPageInSession(false)
  }, [selectedContact?.id])

  useEffect(() => {
    if (!sessions.length) {
      setHasMoreMessages(false)
      return
    }

    if (sessionCursor > sessions.length - 1) {
      setSessionCursor(0)
      setSessionPage(1)
    }
  }, [sessions, sessionCursor])

  useEffect(() => {
    if (!messagesQuery.data) return

    const incomingMessages = messagesQuery.data.data.map((message) => ({
      id: message.id,
      text: message.text,
      timestamp: message.timestamp || "Sem horário",
      sent: message.sent,
      sessionId: message.sessionId,
    }))

    setLoadedMessages((current) => mergeOlderMessages(incomingMessages, current))

    const hasNextPage = Boolean(messagesQuery.data.meta.hasNextPage)
    setHasNextPageInSession(hasNextPage)
    setHasMoreMessages(hasNextPage || sessionCursor < sessions.length - 1)
  }, [messagesQuery.data, sessionCursor, sessions.length])

  const handleLoadOlderMessages = () => {
    if (!activeSessionId) return
    if (messagesQuery.isFetching || !hasMoreMessages) return

    if (hasNextPageInSession) {
      setSessionPage((current) => current + 1)
      return
    }

    if (sessionCursor < sessions.length - 1) {
      setSessionCursor((current) => current + 1)
      setSessionPage(1)
      return
    }

    setHasMoreMessages(false)
  }

  const isInitialMessagesLoading =
    selectedContact !== null &&
    (sessionsQuery.isLoading || (messagesQuery.isLoading && loadedMessages.length === 0))

  const isLoadingOlderMessages = messagesQuery.isFetching && loadedMessages.length > 0

  const handleSendMessage = async (text: string) => {
    if (!activeSessionId) return
    try {
      const response = await sendMessage({ sessionId: activeSessionId, text })
      
      if (response && response.success && response.messageId) {
        setLoadedMessages((current) => {
          const newMessage: Message = {
            id: response.messageId,
            text,
            timestamp: new Date().toISOString(),
            sent: true,
            sessionId: activeSessionId,
          }
          return mergeOlderMessages(current, [newMessage])
        })
        queryClient.invalidateQueries({ queryKey: ["sched-ai-monitoring-messages"] })
      }
    } catch (e) {
      console.error("Erro ao enviar mensagem", e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <BotMessageSquare className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Monitoramento de Conversas</h3>
              <p className="text-sm text-muted-foreground">
                Conversas agrupadas por usuário, com histórico contínuo em lotes de 30 mensagens.
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
              messages={loadedMessages}
              onLoadOlderMessages={handleLoadOlderMessages}
              hasMoreMessages={hasMoreMessages}
              isLoadingMessages={isInitialMessagesLoading}
              isLoadingOlderMessages={isLoadingOlderMessages}
              onSendMessage={handleSendMessage}
              isSending={isSending}
            />
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
