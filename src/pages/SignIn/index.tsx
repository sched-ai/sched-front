import { Button } from "../../components/ui/button";
import abstract from "../../assets/abstract_waves.jpg";
import { useNavigate } from "react-router-dom";
import React from "react";
import { useSignIn } from "@/hooks/api/auth/useSignIn";
import { toast } from "sonner";
import Input from "@/components/ui/input";

export const SignIn = () => {

  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const signIn = useSignIn({
    onSuccessFn: () => {
      navigate('/');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onErrorFn: (err: any) => {
      const errorMessage = err?.response?.data?.message || "Email ou senha inválidos.";
      toast.error(errorMessage)
    }
  });

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    signIn.mutate({ email, password });
  }


  return (
    <div
      className="flex p-11 w-full min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${abstract})` }}
    >
      <div className="flex flex-col w-full gap-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl lg:text-4xl font-semibold text-white italic">SCHED</h1>
          <Button
            variant="seccondary"
            className="flex lg:hidden"
            onClick={() => {
              window.location.href = "/signup";
            }}
          >
            Cadastre-se
          </Button>
        </div>
        <div className="flex justify-between h-full">
             <div className="lg:flex flex-col justify-end max-w-[640px] w-full hidden">
              <h2 className="lg:text-4xl text-2xl font-light text-white">
                Novo por aqui?
              </h2>
              <h2 className="lg:text-4xl font-semibold text-white max-w-[250px] mb-10 text-2xl">
                Crie sua conta! 
              </h2>
              <Button
                variant="seccondary"
                className="w-full max-w-[394px]"
                onClick={() => {
                  window.location.href = "/signup";
                }}
              >
                CADASTRE-SE
              </Button>
            </div>
            <div className="w-full max-w-[510px] m-auto">
            <form
                onSubmit={handleLogin}
                className="space-y-6 px-6 py-8 lg:px-10 lg:py-14
                            [background-clip:padding-box,border-box] 
                            backdrop-blur-md bg-black/50"
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
                    type="e-mail"
                    id="email"
                    required
                    placeholder="scheapp@gmail.com"
                    className="text-white border-white"
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
                    />
                    {/* TODO - HABILITAR TROCA DE SENHA */}
                    {/* <Button variant="link" type="button" className="text-[#6cacff]">Esqueci minha senha</Button> */}
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
                    className="text-[#6cacff]"
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
    </div>
  );
};
