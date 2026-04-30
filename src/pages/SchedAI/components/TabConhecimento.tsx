import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Trash2, Plus, Play, TriangleAlert } from "lucide-react"
import { useState } from "react"
import { BotPlaygroundDrawer } from "./BotPlaygroundDrawer"
import { useGetFaqs } from "@/hooks/api/useGetFaqs"
import { useCreateFaq } from "@/hooks/api/useCreateFaq"
import { useDeleteFaq } from "@/hooks/api/useDeleteFaq"
import { useGetCompany } from "@/hooks/api/useGetCompany"
import { useUpdateBotStatus } from "@/hooks/api/useUpdateBotStatus"

export function TabConhecimento() {
  const { data: faqs, isLoading: isLoadingFaqs } = useGetFaqs()
  const { data: company, isLoading: isLoadingCompany } = useGetCompany()
  const createFaqMutation = useCreateFaq()
  const deleteFaqMutation = useDeleteFaq()
  const updateBotStatusMutation = useUpdateBotStatus()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [faqModalOpen, setFaqModalOpen] = useState(false)
  const [newTrigger, setNewTrigger] = useState("")
  const [newAnswer, setNewAnswer] = useState("")
  const [faqToDelete, setFaqToDelete] = useState<{ id: string; trigger: string } | null>(null)

  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false)
  const [pendingToggleStatus, setPendingToggleStatus] = useState<boolean | null>(null)

  const handleCreateFaq = () => {
    if (!newTrigger.trim() || !newAnswer.trim()) return
    createFaqMutation.mutate(
      { trigger: newTrigger, answer: newAnswer },
      {
        onSuccess: () => {
          setFaqModalOpen(false)
          setNewTrigger("")
          setNewAnswer("")
        },
      }
    )
  }

  const handleConfirmDeleteFaq = () => {
    if (!faqToDelete) return

    deleteFaqMutation.mutate(faqToDelete.id, {
      onSuccess: () => {
        setFaqToDelete(null)
      },
    })
  }

  const handleToggleClick = (checked: boolean) => {
    setPendingToggleStatus(checked)
    setConfirmToggleOpen(true)
  }

  const handleConfirmToggle = () => {
    if (pendingToggleStatus !== null) {
      updateBotStatusMutation.mutate(
        { botStatus: pendingToggleStatus },
        {
          onSuccess: () => {
            setConfirmToggleOpen(false)
            setPendingToggleStatus(null)
          }
        }
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
        <div className="flex justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Operação do Agente</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ligue ou desligue o atendimento automático da IA.
            </p>
          </div>
          <Button variant="outline" onClick={() => setDrawerOpen(true)}>
            <Play className="w-4 h-4 mr-2" />
            Testar Agente
          </Button>
        </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              id="master-switch"
              onClick={() => handleToggleClick(!company?.botStatus)}
              disabled={isLoadingCompany || updateBotStatusMutation.isPending}
              className={`relative inline-flex items-center w-[72px] h-8 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                company?.botStatus ? 'bg-green-500 focus:ring-green-500' : 'bg-red-500 focus:ring-red-500'
              }`}
            >
              <span className="sr-only">Ligar/Desligar Agente</span>
              <span 
                className={`absolute text-xs font-bold text-white transition-all ${
                  company?.botStatus ? 'left-2' : 'right-2'
                }`}
              >
                {company?.botStatus ? 'ON' : 'OFF'}
              </span>
              <div 
                className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-sm shadow-sm transition-transform ${
                  company?.botStatus ? 'translate-x-[40px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">FAQ Dinâmica</h3>
            <p className="text-sm text-muted-foreground">Respostas rápidas para as perguntas mais comuns.</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={() => setFaqModalOpen(true)}
            disabled={faqs && faqs.length >= 5}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar {faqs ? `(${faqs.length}/5)` : ''}
          </Button>
        </div>
        
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">Pergunta Gatilho</th>
                <th className="px-6 py-3 font-medium">Resposta Base</th>
                <th className="px-6 py-3 font-medium w-32">Atualização</th>
                <th className="px-6 py-3 font-medium w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoadingFaqs ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">Carregando...</td>
                </tr>
              ) : faqs?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">Nenhum conhecimento adicionado.</td>
                </tr>
              ) : (
                faqs?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{item.trigger}</td>
                    <td className="px-6 py-4 truncate max-w-[300px] text-muted-foreground" title={item.answer}>{item.answer}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setFaqToDelete({ id: item.id, trigger: item.trigger })}
                        disabled={deleteFaqMutation.isPending}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
          {/* <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100 pb-2 border-b">Segurança e Alterações</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-cancel">Permitir cancelamento automático</Label>
              <p className="text-sm text-muted-foreground">
                A IA poderá remover o compromisso da agenda caso o paciente solicite.
              </p>
            </div>
            <Switch id="allow-cancel" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-reschedule">Permitir remarcação automática</Label>
              <p className="text-sm text-muted-foreground">
                A IA poderá trocar o dia/horário do paciente sem intervenção humana.
              </p>
            </div>
            <Switch id="allow-reschedule" />
          </div>
        </div>
      </div> */}
      <BotPlaygroundDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      <Dialog
        open={faqModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFaqModalOpen(false)
            setNewTrigger("")
            setNewAnswer("")
          }
        }}
      >
        <DialogContent className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-0 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <DialogTitle className="text-xl text-slate-900">Adicionar Conhecimento (FAQ)</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-1">
              Cadastre uma pergunta gatilho e a resposta base que a IA deve usar.
            </DialogDescription>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trigger">Pergunta Gatilho</Label>
              <input
                id="trigger"
                placeholder="Ex: Qual o horário de funcionamento?"
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Resposta Base</Label>
              <textarea
                id="answer"
                placeholder="Ex: De segunda a sexta das 08:00 às 18:00."
                rows={4}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="px-2"
              onClick={() => {
                setFaqModalOpen(false)
                setNewTrigger("")
                setNewAnswer("")
              }}
              disabled={createFaqMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-2"
              onClick={handleCreateFaq}
              disabled={createFaqMutation.isPending || !newTrigger.trim() || !newAnswer.trim()}
            >
              {createFaqMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmToggleOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmToggleOpen(false)
            setPendingToggleStatus(null)
          }
        }}
      >
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TriangleAlert className="w-5 h-5 text-amber-500" />
            <DialogTitle className="text-lg text-slate-900">Confirmar alteração</DialogTitle>
          </div>

          <DialogDescription className="text-sm text-slate-600 mt-1">
            Você está prestes a
            <span className={`font-semibold ${pendingToggleStatus ? " text-green-600" : " text-red-600"}`}>
              {pendingToggleStatus ? " LIGAR " : " DESLIGAR "}
            </span>
            o atendimento automático da IA.
          </DialogDescription>

          <p className="mt-1 text-sm text-slate-600">
            {pendingToggleStatus
              ? "A partir de agora, a IA começará a responder e gerenciar os agendamentos."
              : "A IA deixará de responder os pacientes até que seja ligada novamente."}
          </p>

          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="px-2"
              onClick={() => {
                setConfirmToggleOpen(false)
                setPendingToggleStatus(null)
              }}
              disabled={updateBotStatusMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-2"
              onClick={handleConfirmToggle}
              disabled={updateBotStatusMutation.isPending}
            >
              {updateBotStatusMutation.isPending ? "Confirmando..." : "Confirmar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!faqToDelete}
        onOpenChange={(open) => {
          if (!open) setFaqToDelete(null)
        }}
      >
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TriangleAlert className="w-5 h-5 text-red-500" />
            <DialogTitle className="text-lg text-slate-900">Confirmar exclusão</DialogTitle>
          </div>

          <DialogDescription className="text-sm text-slate-600 mt-1">
            Tem certeza que deseja excluir o FAQ
            <span className="font-semibold text-slate-900"> "{faqToDelete?.trigger}"</span>? Essa ação não pode ser desfeita.
          </DialogDescription>

          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="px-2"
              onClick={() => setFaqToDelete(null)}
              disabled={deleteFaqMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white px-2"
              onClick={handleConfirmDeleteFaq}
              disabled={deleteFaqMutation.isPending}
            >
              {deleteFaqMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
