import { Button } from "../../components/ui/button";
import abstract from "../../assets/abstract_waves.jpg";
import { Input } from "../../components/ui/input";

export const SignIn = () => {
  return (
    <div
      className="flex p-6 w-full min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${abstract})` }}
    >
      <div className="flex flex-col justify-between w-full gap-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-white italic">SCHED</h1>
          <Button
            variant="seccondary"
            onClick={() => {
              window.location.href = "/signup";
            }}
          >
            Cadastre-se
          </Button>
        </div>
        <div className="w-full max-w-[510px] m-auto">
          <form
            className="space-y-6 px-6 py-8 lg:px-10 lg:py-14
                        [background-clip:padding-box,border-box] 
                        backdrop-blur-md bg-black/45"
          >
            <div className="text-start text-white">
              <h1 className="lg:text-[40px] font-semibold leading-[1.2] text-2xl">
                Acesse sua conta
              </h1>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-normal text-white mb-2"
              >
                Email
              </label>
              <Input
                type="email"
                id="email"
                required
                placeholder="scheapp@gmail.com"
                className="text-white border-white"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-normal text-white mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <Input
                  type="password"
                  id="password"
                  required
                  placeholder="Insira sua senha"
                  className="text-white border-white"
                />
                <Button variant="link">Esqueci minha senha</Button>
              </div>
            </div>

            <Button type="submit" variant="secondary" className="w-full font-semibold">
              ENTRAR
            </Button>

            <div className="text-center">
              <span className="text-white font-light">
                Novo por aqui?{" "}
              </span>
              <Button
                variant="link"
                onClick={() => {
                  window.location.href = "/signup";
                }}
              >
                Cadastre-se
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
