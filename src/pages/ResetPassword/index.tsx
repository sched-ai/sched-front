import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import abstract from '../../assets/abstract_waves.jpg';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { useResetPassword } from '@/hooks/api/auth/useResetPassword';
import { useValidateResetPasswordToken } from '@/hooks/api/auth/useValidateResetPasswordToken';

const passwordRule = 'Pelo menos 8 caracteres, com letras e números.';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const { data, isLoading, isError } = useValidateResetPasswordToken(token);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPassword = useResetPassword({
    onSuccessFn: (resp) => {
      toast.success(resp?.message || 'Senha redefinida com sucesso.');
      navigate('/signin');
    },
    onErrorFn: (err: any) => {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'Não foi possível redefinir sua senha.';
      toast.error(errorMessage);
    }
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas informadas não coincidem.');
      return;
    }

    resetPassword.mutate({
      token,
      newPassword: password,
    });
  };

  const isTokenInvalid = !token || isError || data?.valid === false;

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
          <div className="w-full max-w-[560px] m-auto">
            <div className="space-y-6 px-6 py-8 lg:px-10 lg:py-14 shadow-custom [background-clip:padding-box,border-box] backdrop-blur-md bg-black/50 text-white">
              <div className="text-start mb-4">
                <h1 className="lg:text-[40px] font-semibold leading-[1.2] text-2xl">
                  Redefinir senha
                </h1>
                <p className="text-[#d9d9d9]">
                  Crie uma nova senha segura para voltar a acessar sua conta.
                </p>
              </div>

              {isLoading && (
                <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-4 py-4 text-sm text-white/90">
                  <Spinner className="size-5" />
                  Validando seu link de redefinição...
                </div>
              )}

              {!isLoading && isTokenInvalid && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-4 text-sm text-red-100">
                    Este link é inválido ou expirou. Solicite uma nova recuperação de senha para continuar.
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    onClick={() => navigate('/forgot-password')}
                  >
                    SOLICITAR NOVO LINK
                  </Button>
                </div>
              )}

              {!isLoading && !isTokenInvalid && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        className="peer h-12 w-full px-2 bg-white/5 rounded-lg border-gray-300 placeholder-transparent focus:outline-none focus:border-blue-600 border-2 text-white"
                        placeholder="Nova senha"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <label
                        htmlFor="password"
                        className="absolute left-3 -top-6 text-sm text-white transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-sm peer-focus:left-0"
                      >
                        Nova senha
                      </label>
                    </div>
                    <p className="text-sm text-white/70">{passwordRule}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        className="peer h-12 w-full px-2 bg-white/5 rounded-lg border-gray-300 placeholder-transparent focus:outline-none focus:border-blue-600 border-2 text-white"
                        placeholder="Confirme sua senha"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <label
                        htmlFor="confirmPassword"
                        className="absolute left-3 -top-6 text-sm text-white transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-6 peer-focus:text-sm peer-focus:left-0"
                      >
                        Confirmar nova senha
                      </label>
                    </div>
                    <p className="text-sm text-white/70">Use exatamente a mesma senha acima.</p>
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    disabled={resetPassword.isPending}
                  >
                    {resetPassword.isPending ? 'SALVANDO...' : 'SALVAR NOVA SENHA'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
