import { ChatList } from "@/components/ChatList/ChatList"
import { ChatWindow, type Contact, type Message } from "@/components/ChatWindow/ChatWindow"
import {
  useGetMonitoringSessionMessages,
  useGetMonitoringUserSessions,
  useGetMonitoringUsers,
  useSendMonitoringMessage,
  useToggleClientBotStatus,
  type MonitoringMessagesResponse,
} from "@/hooks/api/useSchedAiMonitoring"
import { formatBusinessHour } from "@/lib/dateTime"
import { formatPhone } from "@/util/helper"
import { BotMessageSquare } from "lucide-react"
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { StorageService } from "@/services"
import useAPI from "@/hooks/api/useAPI"

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
  const [isFetchingOlder, setIsFetchingOlder] = useState(false)

  const { get } = useAPI<MonitoringMessagesResponse>()

  const { mutateAsync: sendMessage, isPending: isSending } = useSendMonitoringMessage()
  const { mutateAsync: toggleBot, isPending: isTogglingBot } = useToggleClientBotStatus()

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
      clientId: user.clientId,
      name: user.clientName,
      avatar: toAvatarLabel(user.clientName),
      lastMessage: user.latestMessage || "Sem mensagens",
      timestamp: formatListTimestamp(user.latestTimestamp),
      subtitle: formatPhone(user.clientPhone),
      isBotActive: user.isBotActive,
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

  const latestSessionId = sessions[0]?.sessionId
  const activeSessionId = latestSessionId

  // A query principal SEMPRE aponta para a sessão mais recente, garantindo que
  // updates do SSE (que invalidam a query) sempre busquem as novas mensagens.
  const messagesQuery = useGetMonitoringSessionMessages({
    sessionId: latestSessionId,
    page: 1,
    limit: 30,
    enabled: Boolean(selectedContact?.id && latestSessionId),
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

    // Só atualizamos os metadados de paginação se ainda estivermos no início
    if (sessionCursor === 0 && sessionPage === 1) {
      const hasNextPage = Boolean(messagesQuery.data.meta.hasNextPage)
      setHasNextPageInSession(hasNextPage)
      setHasMoreMessages(hasNextPage || sessions.length > 1)
    }
  }, [messagesQuery.data, sessionCursor, sessionPage, sessions.length])

  const handleLoadOlderMessages = useCallback(async () => {
    if (!selectedContact?.id || !hasMoreMessages || isFetchingOlder || messagesQuery.isFetching) return
    setIsFetchingOlder(true)

    try {
      let targetCursor = sessionCursor
      let targetPage = sessionPage

      if (hasNextPageInSession) {
        targetPage += 1
      } else if (sessionCursor < sessions.length - 1) {
        targetCursor += 1
        targetPage = 1
      } else {
        setHasMoreMessages(false)
        setIsFetchingOlder(false)
        return
      }

      const targetSessionId = sessions[targetCursor].sessionId
      const params = new URLSearchParams()
      params.append("page", String(targetPage))
      params.append("limit", "30")

      const response = await get({
        endpoint: `sched-ai/monitoring/sessions/${targetSessionId}/messages?${params.toString()}`,
        label: "Mensagens antigas",
        showSuccessFeedback: false,
      })

      if (response && response.data) {
        const incomingMessages = response.data.map((message) => ({
          id: message.id,
          text: message.text,
          timestamp: message.timestamp || "Sem horário",
          sent: message.sent,
          sessionId: message.sessionId,
        }))

        setLoadedMessages((current) => mergeOlderMessages(incomingMessages, current))
        setSessionCursor(targetCursor)
        setSessionPage(targetPage)
        
        const hasNext = Boolean(response.meta?.hasNextPage)
        setHasNextPageInSession(hasNext)
        setHasMoreMessages(hasNext || targetCursor < sessions.length - 1)
      }
    } catch (e) {
      console.error("Erro ao carregar mensagens antigas", e)
    } finally {
      setIsFetchingOlder(false)
    }
  }, [
    selectedContact?.id,
    hasMoreMessages,
    isFetchingOlder,
    messagesQuery.isFetching,
    hasNextPageInSession,
    sessionCursor,
    sessionPage,
    sessions,
    get
  ])

  // Auto-load de sessões antigas caso a sessão atual não preencha o limite de 30 mensagens
  // Isso garante que haja mensagens suficientes para gerar o scrollbar
  useEffect(() => {
    if (
      loadedMessages.length > 0 &&
      loadedMessages.length < 30 &&
      hasMoreMessages &&
      !messagesQuery.isFetching
    ) {
      const timer = setTimeout(() => {
        handleLoadOlderMessages()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loadedMessages.length, hasMoreMessages, messagesQuery.isFetching, handleLoadOlderMessages])

  const isInitialMessagesLoading =
    selectedContact !== null &&
    (sessionsQuery.isLoading || (messagesQuery.isLoading && loadedMessages.length === 0))

  const isLoadingOlderMessages = isFetchingOlder

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
        queryClient.invalidateQueries({ queryKey: ["sched-ai-monitoring-users"] })
        queryClient.invalidateQueries({ queryKey: ["sched-ai-monitoring-messages"] })
      }
    } catch (e) {
      console.error("Erro ao enviar mensagem", e)
    }
  }

  const handleToggleBot = async (isBotActive: boolean) => {
    if (!selectedContact?.clientId) return
    try {
      await toggleBot({ clientId: selectedContact.clientId, isBotActive })
      queryClient.invalidateQueries({ queryKey: ["sched-ai-monitoring-users"] })
    } catch (e) {
      console.error("Erro ao alternar bot", e)
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
                Acompanhe as conversas da IA com seus pacientes de forma organizada e em tempo real.
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
              onToggleBot={handleToggleBot}
              isTogglingBot={isTogglingBot}
            />
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
