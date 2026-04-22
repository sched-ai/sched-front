import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch as ToggleSwitch } from "@/components/ui/switch"
import { Switch } from "antd"
import {Trash2, Plus, Play } from "lucide-react"
import { useState } from "react"
import { BotPlaygroundDrawer } from "./BotPlaygroundDrawer"

export function TabConhecimento() {
  const faqList = [
    { id: 1, trigger: "Qual o horário de funcionamento?", answer: "De segunda a sexta as 08:00 as 18:00.", updated: "10/04/2026" },
    { id: 2, trigger: "Aceita convênio Unimed?", answer: "Sim, aceitamos Unimed, Bradesco e SulAmérica.", updated: "15/04/2026" },
    { id: 3, trigger: "Onde fica a clínica?", answer: "Estamos localizados na Avenida Principal, 1000.", updated: "01/04/2026" },
  ]

    const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Operação do Agente</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ligue ou desligue o atendimento automático da IA.
            </p>
          </div>
           <div className="flex items-center gap-3">
        </div>
          <div className="flex items-center gap-3">
            <ToggleSwitch id="master-switch" defaultChecked />
            <label htmlFor="master-switch" className="text-sm font-medium cursor-pointer whitespace-nowrap">
              Operação Ligar/Desligar
            </label>
          </div>
        </div>
          <Button variant="outline" onClick={() => setDrawerOpen(true)} className="mt-6">
            <Play className="w-4 h-4 mr-2" />
            Testar Agente
          </Button>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">FAQ Dinâmica</h3>
            <p className="text-sm text-muted-foreground">Respostas rápidas para as perguntas mais comuns.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Conhecimento
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
              {faqList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{item.trigger}</td>
                  <td className="px-6 py-4 truncate max-w-[300px] text-muted-foreground" title={item.answer}>{item.answer}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{item.updated}</td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
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
      </div>
      <BotPlaygroundDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
