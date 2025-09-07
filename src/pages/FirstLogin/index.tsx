import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import abstract from "../../assets/abstract_waves.jpg";

export const FirstLogin = () => {
  return (
    <div className="flex w-full min-h-screen bg-white">
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-cover bg-center border-r border-blue-400"
        style={{ backgroundImage: `url(${abstract})` }}
      >
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-semibold italic text-white mb-8">SCHED</h1>
          <h2 className="text-4xl font-light text-white mb-2">Vamos começar!</h2>
          <h2 className="text-4xl font-bold text-white">Preencha o formulário com suas informações</h2>
        </div>
        <div className="flex justify-end">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-300 to-purple-400 opacity-60" />
        </div>
      </div>
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 py-12 relative">
        <div className="flex max-w-md w-full mx-auto items-center" style={{ minHeight: '80vh' }}>
          {/* linha vertical */}
          <div className="hidden lg:flex flex-col justify-center">
            <div className="w-[1px] bg-blue-500 mr-20" style={{ height: '80vh', borderRadius: '9999px' }} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-black mb-2">Falta pouco!</h1>
            <p className="text-gray-500 mb-8">nos informe seu nome e sobrenome</p>
            <form className="space-y-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <Input id="nome" placeholder="Digite seu nome" className="border-blue-400 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="sobrenome" className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                <Input id="sobrenome" placeholder="Digite seu sobrenome" className="border-gray-300 focus:border-blue-400" />
              </div>
              <div className="flex justify-between items-center mt-6">
                <span className="text-black font-medium">Passo 1 de 2</span>
                <Button type="submit" variant="secondary" className="font-semibold flex items-center gap-2">
                  PRÓXIMO <span aria-hidden>→</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
