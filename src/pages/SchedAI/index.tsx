import { Button } from "@/components/ui/button"
import { Settings, ArrowLeft } from "lucide-react"
import { useState } from "react"

import { TabConhecimento } from "./components/TabConhecimento"
import { TabMonitoramento } from "./components/TabMonitoramento"

export function SchedAI() {
  const [activeScreen, setActiveScreen] = useState<"monitoramento" | "configuracoes">("monitoramento")

  return (
    <div className="flex-1 space-y-6 pb-4 px-6 pt-6 md:px-8 md:pt-8">
      {activeScreen === "configuracoes" && (
        <div className="flex items-center justify-start">
          <Button
            variant="ghost"
            className="px-2 text-slate-700 hover:text-slate-900"
            onClick={() => setActiveScreen("monitoramento")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para monitoramento
          </Button>
        </div>
      )}

      {activeScreen === "monitoramento" ? (
        <TabMonitoramento
          headerAction={
            <Button
              variant="outline"
              className="px-4"
              onClick={() => setActiveScreen("configuracoes")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações do agente
            </Button>
          }
        />
      ) : (
        <TabConhecimento />
      )}
    </div>
  )
}
