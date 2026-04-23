import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Modal, Input } from "antd"
import { Trash2, Plus, Play } from "lucide-react"
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
            Adicionar Conhecimento {faqs ? `(${faqs.length}/5)` : ''}
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
                        onClick={() => deleteFaqMutation.mutate(item.id)}
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

      <Modal
        title="Adicionar Novo Conhecimento (FAQ)"
        open={faqModalOpen}
        onOk={handleCreateFaq}
        onCancel={() => {
          setFaqModalOpen(false)
          setNewTrigger("")
          setNewAnswer("")
        }}
        confirmLoading={createFaqMutation.isPending}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="trigger">Pergunta Gatilho</Label>
            <Input 
              id="trigger" 
              placeholder="Ex: Qual o horário de funcionamento?" 
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="answer">Resposta Base</Label>
            <Input.TextArea 
              id="answer" 
              placeholder="Ex: De segunda a sexta das 08:00 às 18:00." 
              rows={4}
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="Confirmar alteração"
        open={confirmToggleOpen}
        onOk={handleConfirmToggle}
        onCancel={() => {
          setConfirmToggleOpen(false)
          setPendingToggleStatus(null)
        }}
        confirmLoading={updateBotStatusMutation.isPending}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <p>
          Você está prestes a <strong className={pendingToggleStatus ? "text-green-600" : "text-red-600"}>
            {pendingToggleStatus ? "LIGAR" : "DESLIGAR"}
          </strong> o atendimento automático da IA.
        </p>
        <p className="mt-2 text-muted-foreground">
          {pendingToggleStatus 
            ? "A partir de agora, a IA começará a responder e gerenciar os agendamentos." 
            : "A IA deixará de responder os pacientes até que seja ligada novamente."}
        </p>
      </Modal>
    </div>
  )
}
