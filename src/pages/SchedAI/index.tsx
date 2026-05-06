import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Settings, ArrowLeft, BotMessageSquare } from "lucide-react"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

import { TabConhecimento } from "./components/TabConhecimento"
import { TabMonitoramento } from "./components/TabMonitoramento"

export function SchedAI() {
  const isMobile = useIsMobile()
  const [activeScreen, setActiveScreen] = useState<"monitoramento" | "configuracoes">("monitoramento")

  return (
    <div className="flex-1 pb-4 px-6 pt-6 md:px-8 md:pt-8">
      <header className="flex items-stretch gap-4 mb-6 md:mb-0 md:gap-0">
        <SidebarTrigger className="w-11 h-11 min-w-[44px] self-start rounded-lg bg-white border border-slate-200 shadow-sm p-0 hover:bg-slate-50 hover:opacity-80 transition-opacity lg:hidden">
          <span className="flex flex-col items-center justify-center gap-1">
            <span className="block h-[2px] w-[18px] rounded-[2px] bg-slate-900/90" />
            <span className="block h-[2px] w-3 rounded-[2px] bg-slate-900/90" />
            <span className="block h-[2px] w-[18px] rounded-[2px] bg-slate-900/90" />
          </span>
        </SidebarTrigger>
        <div className="flex-1">
          {activeScreen === "configuracoes" && (
            <div className="flex items-center justify-start">
              <Button
                variant="ghost"
                className="px-2 text-slate-700 hover:text-slate-900"
                onClick={() => setActiveScreen("monitoramento")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {activeScreen === "monitoramento" ? (
          <TabMonitoramento
            headerAction={
              <Button
                variant="outline"
                className={`icon-flip ${isMobile ? "icon-flip-loop" : ""} ${
                  isMobile ? "px-2 w-8 h-8 flex items-center justify-center" : "px-4"
                }`}
                onClick={() => setActiveScreen("configuracoes")}
              >
                {isMobile ? (
                  <>
                    <div className="icon-flip-inner">
                      <div className="icon-flip-front">
                        <Settings className="w-3.5 h-3.5" />
                      </div>
                      <div className="icon-flip-back">
                        <BotMessageSquare className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Configurações do agente</span>
                  </>
                )}
              </Button>
            }
          />
        ) : (
          <TabConhecimento />
        )}
      </div>
    </div>
  )
}
