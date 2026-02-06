import { Button } from "../../components/ui/button";
import abstract from "../../assets/abstract_signup.png";
import { Input } from "../../components/ui/input";
import React from "react";
import { useSignUp } from "@/hooks/api/auth/useSignUp";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const SignUp = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');

  const navigate = useNavigate();

  const signUp = useSignUp({
    onSuccessFn: () => {
      toast( "Cadastro realizado com sucesso!");
      navigate('/');
    }
  });

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length < 8) {
     toast.error('A senha deve conter no mínimo 8 caracteres.')
      return;
    }

    signUp.mutate({ email, password, name });
  };

  return (
    <>
      <div className="min-h-screen md:flex bg-[#d9d9d9] hidden">
        <div
          className="flex p-11 max-w-[640px] w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${abstract})` }}
        >
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-white italic">
                SCHED
              </h1>
            </div>
            <div>
              <h4 className="lg:text-4xl text-2xl font-light text-white">
                Já possui uma conta?
              </h4>
              <h3 className="lg:text-4xl font-semibold text-white max-w-[290px] mb-10 text-2xl">
                Bem vindo de volta!
              </h3>
              <Button
                variant="light"
                className="w-full"
                onClick={() => {
                  navigate("/signin");
                }}
              >
                LOGIN
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full max-w-[510px] m-auto">
          {/* O onSubmit agora chama a função com validação */}
          <form className="space-y-6 px-8 py-12 bg-white shadow-custom" onSubmit={handleRegister}>
            <div className="text-start">
              <h3 className="lg:text-[40px] font-semibold leading-[1.6] text-2xl">
                Crie sua conta
              </h3>
              <p className="leading-[1.01]">Ou cadastre um novo usuário</p>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#141736] mb-2"
              >
                Nome Completo
              </label>
              <Input title="Nome" type="text" id="name" required placeholder="Ex: John Doe" onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#141736] mb-2"
              >
                Email
              </label>
              <Input title="Email" type="e-mail" id="email" required placeholder="Ex: scheapp@gmail.com" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#141736] mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <Input
                  type="password"
                  id="password"
                  required
                  placeholder="Insira sua senha"
                  minLength={8}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              CADASTRAR
            </Button>
            <div className="text-center">
              <span className="text-gray-600">Já possui uma conta? </span>
              <Button
                variant="link"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Login
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <div
        className="flex md:hidden p-6 w-full min-h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${abstract})` }}
      >
        <div className="flex flex-col justify-between w-full gap-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white italic">SCHED</h2>
            <Button
              variant="light"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Login
            </Button>
          </div>
          <div className="w-full max-w-[510px] m-auto">
            <form
              className="space-y-6 px-6 py-8
                        [background-clip:padding-box,border-box] 
                        backdrop-blur-md bg-black/45"
              onSubmit={handleRegister}
            >
              <div className="text-start text-white">
                <h3 className="lg:text-[40px] font-semibold leading-[1.2] text-2xl">
                  Crie sua conta
                </h3>
                <p className="leading-[1.2]">Ou cadastre um novo usuário</p>
              </div>

              <div>
                  <label
                    htmlFor="name_mobile"
                    className="block text-sm font-normal text-white mb-2"
                    >
                    Nome Completo
                  </label>
                  <Input 
                    type="text" 
                    id="name_mobile" 
                    required 
                    placeholder="Ex: John Doe" 
                    className="text-white"
                    onChange={(e) => setName(e.target.value)}
                  />
              </div>

              <div>
                <label
                  htmlFor="email_mobile"
                  className="block text-sm font-normal text-white mb-2"
                >
                  Email
                </label>
                <Input
                  type="e-mail"
                  id="email_mobile"
                  required
                  placeholder="scheapp@gmail.com"
                  className="text-white"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password_mobile"
                  className="block text-sm font-normal text-white mb-2"
                >
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    id="password_mobile"
                    required
                    placeholder="Insira sua senha"
                    minLength={8}
                    className="text-white border-white"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" variant="secondary" className="w-full">
                CADASTRAR
              </Button>
              <div className="text-center">
                <span className="text-white font-light">Já possui uma conta? </span>
                <Button
                  variant="link"
                  onClick={() => {
                    window.location.href = "/";
                  }}
                >
                  Login
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};