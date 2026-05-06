import { ChatList } from "@/components/ChatList/ChatList"
import { ChatWindow, type Contact, type Message } from "@/components/ChatWindow/ChatWindow"
import {
  useGetMonitoringSessionMessages,
  useGetMonitoringUserSessions,
  useGetMonitoringUsers,
  useSendMonitoringMessage,
  useToggleClientBotStatus,
  useMarkMonitoringUserAsRead,
  type MonitoringMessagesResponse,
} from "@/hooks/api/useSchedAiMonitoring"
import { formatBusinessHour } from "@/lib/dateTime"
import { formatPhone } from "@/util/helper"
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
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

// Som de notificação embutido em Base64 (um "pop" suave e curto)
const NOTIFICATION_SOUND_URI = "data:audio/mp3;base64,//tQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAHAAACjwAHEhISEhISEhIcJycnJycnJycnOUxMTExMTExMTFhjY2NjY2NjY2NyiIiIiIiIiIiIknp6enp6enp6eq+8vLy8vLy8vLzP5+fn5+fn5+fn4QAAAAAAAAAAAAAAAAAAAAAAADhJbmZvAAAADwAAABgAAAEhAHy23wAAAAAAAAAAAAAAAAAAAAAAAEwhBQAOAAABX9fG7q8AAAAAAAAAAAAAAAAAAAAAAABMYXZjNTguMTM0LjEwMAAAAAAAAAAAAAAA//tQxAAAAAMHn7kAAAH8gA70gAAAC8X/2AAAn2AAABQAACfXgAAAAAAAA/v/6//4//x2r6////n9f/n/9/+oAABwAAAHAAAAM2k73c09e3e7ve7ve7ve7ve7vf///wAASAAAAwAAAE+v2/9f9////3+v/5///2AADgAAAcAAAAoE4B2m73d72/d7297e9ve3vb3t7297e9v///wAAAAAAAAA//tQxBwAAAHE2bwAAAIMAAACgAAAAXhZvcAACOQAAAKAAAAAAAAC/1///X+v///wB2D/r/v////8AcAAABwAAAFy/7u97e9ve3vb3t7297e9ve3vb3t72////wAAXAAAAcAAABfr+v/X/////r/6///9fwAwAAADgAAALhLnu7ve3vb3t7297e9ve3vb3t7297e9////AAAsAAAOwAA//tQxEYAAAHOZ/gAAAPoAAACgAAAAXg5/cAAANsAAAKAAAAL8N9f///X/////f3/7///0AAAcAAABwAAAKhJvu7ve3vb3t7297e9ve3vb3t7297e9v///wAAAAAAAABQ////f/////f///4AAOAAAA4AAAAh1ne7ve3vb3t7297e9ve3vb3t7297e9ve3v////AAAAAAAAAAO//tQxGkAAAHm2bYAAANAAAACgAAAAXR5u8AAAJqAAAKAAAAA//4v9/////4//+v///wAA8AAADwAAAHxIru7ve3vb3t7297e9ve3vb3t7297e9ve3////wAASAAAAwAAAC+j/b////9////w////AAAA4AAAA4AAAAf1Lu73t7297e9ve3vb3t7297e9ve3vb3t73////wAASAAAAwAA//tQxJUAAAHSGbkAAAGoAAACgAAAAWj5tsAAAJoAAAKAAAAA+s1/r////7////v/9//8AAAAcAAAAcAAAAeUzvd7297e9ve3vb3t7297e9ve3vb3t7297////AAAAAAAAAE+N/r///X/////7//X/wAAOAAAA4AAABjUy7ve3vb3t7297e9ve3vb3t7297e9ve3vb3////AAAAAAAAAA"

export function TabMonitoramento({ headerAction }: { headerAction?: ReactNode } = {}) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [sessionCursor, setSessionCursor] = useState(0)
  const [sessionPage, setSessionPage] = useState(1)
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([])
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [hasNextPageInSession, setHasNextPageInSession] = useState(false)
  const [isFetchingOlder, setIsFetchingOlder] = useState(false)

  // Ref para controle do som de notificação
  const prevUnreadCountsRef = useRef<Record<string, boolean>>({})

  const { get } = useAPI<MonitoringMessagesResponse>()

  const { mutateAsync: sendMessage, isPending: isSending } = useSendMonitoringMessage()
  const { mutateAsync: toggleBot, isPending: isTogglingBot } = useToggleClientBotStatus()
  const { mutateAsync: markAsRead } = useMarkMonitoringUserAsRead()

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    return users.map((user): Contact & { latestMessageId?: number } => ({
      id: user.clientPhone,
      clientId: user.clientId,
      name: user.clientName,
      avatar: toAvatarLabel(user.clientName),
      lastMessage: user.latestMessage || "Sem mensagens",
      timestamp: formatListTimestamp(user.latestTimestamp),
      subtitle: formatPhone(user.clientPhone),
      isBotActive: user.isBotActive,
      unread: selectedContact?.id === user.clientPhone ? false : user.unread,
      latestMessageId: user.latestMessageId,
    }))
  }, [usersQuery.data, selectedContact?.id])

  // Efeito para tocar o som de notificação
  useEffect(() => {
    let shouldPlaySound = false
    const currentUnreadCounts: Record<string, boolean> = {}

    for (const contact of contacts) {
      if (contact.unread) {
        currentUnreadCounts[contact.id] = true
        // Toca o som se a mensagem não lida for de uma conversa que:
        // 1. Antes não estava como 'unread'
        // 2. E não é a conversa atualmente selecionada (a que a gente está lendo agora)
        if (!prevUnreadCountsRef.current[contact.id] && selectedContact?.id !== contact.id) {
          shouldPlaySound = true
        }
      }
    }

    if (shouldPlaySound) {
      const audio = new Audio(NOTIFICATION_SOUND_URI)
      audio.volume = 0.5
      audio.play().catch(console.error)
    }

    prevUnreadCountsRef.current = currentUnreadCounts
  }, [contacts, selectedContact?.id])

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

  // Efeito para atualizar propriedades críticas do contato ativo e auto-deselecionar se apagado
  useEffect(() => {
    if (!contacts.length) return

    // Tenta encontrar o contato selecionado na lista atualizada para pegar dados novos (como isBotActive e unread)
    const updatedContact = selectedContact
      ? contacts.find((contact) => contact.id === selectedContact.id)
      : null

    if (updatedContact) {
      if (updatedContact.isBotActive !== selectedContact?.isBotActive) {
        setSelectedContact(updatedContact)
      }
    }
    // Nota: Nós intencionalmente removemos o 'setSelectedContact(contacts[0])'
    // para que a tela inicie sem nenhuma conversa selecionada.
  }, [contacts, selectedContact])

  // Efeito para marcar como lida quando uma conversa está selecionada e recebe mensagens
  useEffect(() => {
    if (!selectedContact || !usersQuery.data?.data) return

    const originalUser = usersQuery.data.data.find((c) => c.clientPhone === selectedContact.id)
    if (originalUser && originalUser.unread && originalUser.latestMessageId) {
      
      // Atualização otimista na cache para a bolinha sumir imediatamente sem piscar
      queryClient.setQueryData(
        ["sched-ai-monitoring-users", 1, 200, undefined],
        (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            data: oldData.data.map((u: any) =>
              u.clientPhone === originalUser.clientPhone ? { ...u, unread: false } : u
            ),
          }
        }
      )

      // Se a conversa aberta tem mensagens novas/não lidas, marca como lida na API
      markAsRead({
        clientPhone: originalUser.clientPhone,
        lastReadMessageId: originalUser.latestMessageId,
      }).catch(console.error)
    }
  }, [usersQuery.data?.data, selectedContact?.id, markAsRead, queryClient])


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
      // Atualização otimista do status do bot: se o humano mandou mensagem, o bot pausa
      if (selectedContact && selectedContact.isBotActive !== false) {
        setSelectedContact({ ...selectedContact, isBotActive: false })
      }

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
    if (!selectedContact?.id) return
    try {
      await toggleBot({ clientPhone: selectedContact.id, isBotActive })
      queryClient.invalidateQueries({ queryKey: ["sched-ai-monitoring-users"] })
    } catch (e) {
      console.error("Erro ao alternar bot", e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900">
        <div className="flex items-start justify-between mb-4 pb-2">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Monitoramento de Conversas</h1>
              <p className="text-muted-foreground mt-2">
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
