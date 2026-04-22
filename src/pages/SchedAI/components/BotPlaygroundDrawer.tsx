import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Send } from "lucide-react"

interface BotPlaygroundDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BotPlaygroundDrawer({ open, onOpenChange }: BotPlaygroundDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-slate-50 p-0 flex flex-col h-full gap-0">
        <SheetHeader className="p-4 bg-[#075E54] text-white flex flex-row items-center justify-between space-y-0 shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#075E54] font-bold">
              AI
            </div>
            <div>
              <SheetTitle className="text-white text-left text-base">Sched AI</SheetTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-green-200">Online</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" title="Resetar Contexto">
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </SheetHeader>

        <div className="flex-1 bg-[#E5DDD5] p-4 overflow-y-auto space-y-4" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain' }}>
          
          <div className="text-center my-4">
            <span className="text-xs bg-white/80 text-slate-500 px-3 py-1 rounded-full shadow-sm">
              Hoje
            </span>
          </div>

          <div className="flex justify-end">
            <div className="bg-[#DCF8C6] p-2.5 rounded-lg rounded-tr-none shadow-sm max-w-[85%]">
              <p className="text-sm text-slate-800">Olá, gostaria de agendar uma consulta</p>
              <span className="text-[10px] text-right block text-slate-500 mt-1">14:30</span>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="bg-white p-2.5 rounded-lg rounded-tl-none shadow-sm max-w-[85%]">
              <p className="text-sm text-slate-800">
                Olá! Sou a Sofia, assistente virtual da clínica. Para prosseguirmos, por favor, poderia me informar o seu CPF?
              </p>
              <span className="text-[10px] text-right block text-slate-500 mt-1">14:30</span>
            </div>
          </div>
          
        </div>

        <div className="bg-[#f0f0f0] p-3 flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Digite uma mensagem..." 
            className="flex-1 rounded-full px-2 py-2 text-sm border-none shadow-sm focus:outline-none focus:ring-1 focus:ring-[#075E54]"
          />
          <Button size="icon" className="rounded-full bg-[#00897B] hover:bg-[#00796B] text-white">
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
