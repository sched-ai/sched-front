import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import abstract from '../../assets/abstract_waves.jpg';
import { Button } from '../../components/ui/button';
import { useForgotPassword } from '@/hooks/api/auth/useForgotPassword';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [requestSent, setRequestSent] = React.useState(false);

  const forgotPassword = useForgotPassword({
    onSuccessFn: (resp) => {
      setRequestSent(true);
      toast.success(resp?.message || 'Se o email existir em nossa base, você receberá as instruções.');
    },
    onErrorFn: (err: any) => {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'Não foi possível iniciar a recuperação de senha.';
      toast.error(errorMessage);
    }
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    forgotPassword.mutate({ email: email.trim() });
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
            variant="light"
            className="font-semibold"
            type="button"
            onClick={() => navigate('/signin')}
          >
            Voltar ao login
          </Button>
        </div>

        <div className="flex justify-center items-center flex-1">
          <div className="w-full max-w-[510px] m-auto">
            <form
              onSubmit={handleSubmit}
              className="space-y-6 px-6 py-8 lg:px-10 lg:py-14 shadow-custom [background-clip:padding-box,border-box] backdrop-blur-md bg-black/50"
            >
              <div className="text-start text-white mb-8">
                <h1 className="lg:text-[40px] font-semibold leading-[1.2] text-2xl">
                  Recuperar acesso
                </h1>
                <p className="text-[#d9d9d9]">
                  Digite o email usado na sua conta. Se ele existir, enviaremos um link seguro para redefinir a senha.
                </p>
              </div>

              <div className="relative mb-8">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  className="peer h-12 w-full border-2 px-2 bg-white/5 rounded-lg border-gray-300 placeholder-transparent focus:outline-none focus:border-blue-600 text-white"
                  placeholder="seu.email@exemplo.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label
                  htmlFor="email"
                  className="absolute left-3 -top-6 text-sm text-white transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-sm peer-focus:left-0"
                >
                  Email
                </label>
              </div>

              {requestSent && (
                <div className="rounded-lg border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
                  Se o email informado existir, você receberá instruções para redefinir sua senha em instantes.
                </div>
              )}

              <Button
                type="submit"
                variant="default"
                className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                disabled={forgotPassword.isPending}
              >
                {forgotPassword.isPending ? 'ENVIANDO...' : 'ENVIAR LINK'}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  type="button"
                  className="text-[#6cacff] bg-transparent"
                  onClick={() => navigate('/signin')}
                >
                  Voltar para o login
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
