import { Button } from "../../components/ui/button";
import abstract from "../../assets/abstract_waves.jpg";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useSignIn } from "@/hooks/api/auth/useSignIn";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = useState(false);

  const signIn = useSignIn({
    onSuccessFn: () => {
      navigate("/");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onErrorFn: (err: any) => {
      const errorMessage =
        err?.response?.data?.message || "Email ou senha inválidos.";
      toast.error(errorMessage);
    },
  });

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    signIn.mutate({ email, password });
  };

  return (
    <div
      className="flex p-11 w-full min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${abstract})` }}
    >
      <div className="flex flex-col w-full gap-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl lg:text-4xl font-semibold text-white italic">
            SCHED
          </h1>
          <Button
            variant="seccondary"
            className="flex lg:hidden"
            type="button"
            onClick={() => {
                navigate("/signup");
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
              type="button"
              onClick={() => {
                navigate("/signup");
              }}
            >
              CADASTRE-SE
            </Button>
          </div>
          <div className="w-full max-w-[510px] m-auto">
            <form
              onSubmit={handleLogin}
              className="space-y-6 px-6 py-8 lg:px-10 lg:py-14 shadow-custom
                            [background-clip:padding-box,border-box] 
                            backdrop-blur-md bg-black/50"
            >
              <div className="text-start text-white mb-12">
                <h1 className="lg:text-[40px] font-semibold leading-[1.2] text-2xl">
                  Acesse sua conta
                </h1>
                <p className="text-[#d9d9d9]">
                  Insira seu email e senha para acessar sua conta.
                </p>
              </div>
              <div className="relative mb-8">
                <input
                  id="email"
                  name="email"
                  type="text"
                  className="peer h-12 w-full border-2 px-2 bg-white/5 rounded-lg border-gray-300 placeholder-transparent focus:outline-none focus:border-blue-600 focus:border-2 text-white"
                  placeholder="seu.email@exemplo.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label
                  htmlFor="email"
                  className="absolute left-3 -top-6 text-sm text-white transition-all 
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                    peer-focus:-top-6 peer-focus:text-sm peer-focus:left-0"
                >
                  Email
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="peer h-12 w-full px-2 bg-white/5 rounded-lg border-gray-300 placeholder-transparent focus:outline-none focus:border-blue-600 border-2 text-white"
                  placeholder="seu.email@exemplo.com"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </div>
                <label
                  htmlFor="password"
                  className="absolute left-3 -top-6 text-sm text-white transition-all 
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                    peer-focus:-top-6 peer-focus:text-sm peer-focus:left-0"
                >
                  Senha
                </label>
                {/* TODO - HABILITAR TROCA DE SENHA */}
                {/* <Button variant="link" type="button" className="text-[#6cacff]">Esqueci minha senha</Button> */}
              </div>

              <Button
                type="submit"
                variant="secondary"
                className="w-full font-semibold bg-blue-600 text-white hover:bg-white hover:text-black transition-colors"
              >
                ENTRAR
              </Button>

              <div className="text-center">
                <span className="text-white font-light">Novo por aqui? </span>
                <Button
                  variant="link"
                  type="button"            
                  className="text-[#6cacff] bg-transparent"
                  onClick={() => {
                    navigate("/signup");
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
