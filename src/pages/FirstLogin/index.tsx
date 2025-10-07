
import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import abstract from "../../assets/abstract_waves.jpg";

type UserType = "empresa" | "autonomo" | "";

export const FirstLogin = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>("");
  const [nameValue, setNameValue] = useState("");
  const progressText = `Passo ${step} de 2`;

  const canProceedStep1 = userType !== "";

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (canProceedStep1) setStep(2);
  };

  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    // envio de dados para back
    console.log({ userType, nameValue });
  };

  // Campos dinâmicos para Step 2
  const step2Label = userType === "empresa" ? "Nome da empresa" : "Nome completo";
  const step2Placeholder = userType === "empresa" ? "Digite o nome da empresa" : "Digite seu nome completo";

  return (
    <div className="min-h-screen w-full">
      {/* Mobile*/}
      <div
        className="flex flex-col w-full min-h-screen bg-cover bg-center lg:hidden p-8"
        style={{ backgroundImage: `url(${abstract})` }}
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-white italic">SCHED</h1>
        </div>
  <div className="flex-1 flex flex-col items-center justify-center w-full py-6 gap-6">
          {step === 1 && (
            <>
              <div className="w-full max-w-[400px] text-start text-white space-y-2 px-1">
                <h2 className="text-2xl font-semibold leading-[1.2]">Vamos começar!</h2>
                <p className="text-gray-300 text-sm">Gostaríamos de conhecer um pouco mais sobre sua atividade</p>
              </div>
              <form
                onSubmit={handleSubmitStep1}
                className="space-y-6 px-6 py-8 w-full max-w-[400px] [background-clip:padding-box,border-box] backdrop-blur-md bg-black/45 rounded-xl shadow-lg"
              >
                <div className="space-y-5">
                  <p className="text-white text-[28px] font-semibold">Você é um(a):</p>
                  <div className="flex flex-col gap-5">
                    <label className="flex items-center gap-3 text-white text-base font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="userType"
                        value="empresa"
                        checked={userType === "empresa"}
                        onChange={() => setUserType("empresa")}
                        className="accent-blue-500 h-4 w-4"
                      />
                      Empresa
                    </label>
                    <label className="flex items-center gap-3 text-white text-base font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="userType"
                        value="autonomo"
                        checked={userType === "autonomo"}
                        onChange={() => setUserType("autonomo")}
                        className="accent-blue-500 h-4 w-4"
                      />
                      Profissional Autônomo
                    </label>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-white font-medium">{progressText}</span>
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={!canProceedStep1}
                    className={`font-semibold flex items-center gap-2 px-6 py-3 ${!canProceedStep1 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    PRÓXIMO <span aria-hidden>→</span>
                  </Button>
                </div>
              </form>
            </>
          )}
          {step === 2 && (
            <>
              <div className="w-full max-w-[400px] text-start text-white space-y-2 px-1">
                <h1 className="text-2xl font-semibold leading-[1.2]">Falta pouco!</h1>
                <p className="text-gray-300 text-sm">nos informe seus dados</p>
              </div>
              <form
                onSubmit={handleSubmitFinal}
                className="space-y-6 px-6 py-8 w-full max-w-[400px] [background-clip:padding-box,border-box] backdrop-blur-md bg-black/45 rounded-xl shadow-lg"
              >
                <div>
                  <label htmlFor="mainNameMobile" className="block text-sm font-normal text-white mb-2">{step2Label}</label>
                  <Input
                    id="mainNameMobile"
                    placeholder={step2Placeholder}
                    className="text-white border-white"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center mt-6">
                  <span className="text-white font-medium">{progressText}</span>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="seccondary"
                      className="font-semibold px-4 py-3"
                      onClick={() => setStep(1)}
                    >
                      VOLTAR
                    </Button>
                    <Button type="submit" variant="secondary" className="font-semibold flex items-center gap-2 px-6 py-3">
                      FINALIZAR <span aria-hidden>✓</span>
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Desktop*/}
      <div className="hidden lg:flex w-full min-h-screen bg-white">
        <div
          className="flex flex-col justify-between w-1/2 p-12 bg-cover bg-center border-r border-blue-400"
          style={{ backgroundImage: `url(${abstract})` }}
        >
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <h1 className="text-3xl font-semibold italic text-white mb-8">SCHED</h1>
              <h2 className="text-4xl font-light text-white mb-2">Vamos começar!</h2>
              <h2 className="text-4xl font-bold text-white max-w-[480px]">Gostaríamos de conhecer um pouco mais sobre sua atividade</h2>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h1 className="text-3xl font-semibold italic text-white mb-8">SCHED</h1>
              <h2 className="text-4xl font-light text-white mb-2">Falta pouco!</h2>
              <h2 className="text-4xl font-bold text-white max-w-[480px]">Preencha o formulário com suas informações</h2>
            </div>
          )}
          <div className="flex justify-end">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-300 to-purple-400 opacity-60" />
          </div>
        </div>
        <div className="flex flex-col justify-center w-1/2 px-8 py-12 relative">
          <div className="flex max-w-md w-full mx-auto items-center" style={{ minHeight: '80vh' }}>
            {/* linha vertical */}
            <div className="flex flex-col justify-center">
              <div className="w-[1px] bg-blue-500 mr-20" style={{ height: '80vh', borderRadius: '9999px' }} />
            </div>
            <div className="flex-1">
              {step === 1 && (
                <form onSubmit={handleSubmitStep1} className="space-y-6">
                  <div className="space-y-6">
                    <p className="text-[28px] font-semibold text-gray-800 tracking-tight">Você é um(a):</p>
                    <div className="flex flex-col gap-5">
                      <label className="flex items-center gap-3 text-gray-800 text-base font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="userTypeDesktop"
                          value="empresa"
                          checked={userType === "empresa"}
                          onChange={() => setUserType("empresa")}
                          className="accent-blue-500 h-4 w-4"
                        />
                        Empresa
                      </label>
                      <label className="flex items-center gap-3 text-gray-800 text-base font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="userTypeDesktop"
                          value="autonomo"
                          checked={userType === "autonomo"}
                          onChange={() => setUserType("autonomo")}
                          className="accent-blue-500 h-4 w-4"
                        />
                        Profissional Autônomo
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-black font-medium">{progressText}</span>
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={!canProceedStep1}
                      className={`font-semibold flex items-center gap-2 px-6 py-3 ${!canProceedStep1 ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      PRÓXIMO <span aria-hidden>→</span>
                    </Button>
                  </div>
                </form>
              )}
              {step === 2 && (
                <form onSubmit={handleSubmitFinal} className="space-y-6">
                  <div>
                    <label htmlFor="mainNameDesktop" className="block text-sm font-medium text-gray-700 mb-1">{step2Label}</label>
                    <Input
                      id="mainNameDesktop"
                      placeholder={step2Placeholder}
                      className="border-blue-400 focus:border-blue-500"
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-black font-medium">{progressText}</span>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="seccondary"
                        className="font-semibold px-4 py-3"
                        onClick={() => setStep(1)}
                      >
                        VOLTAR
                      </Button>
                      <Button type="submit" variant="secondary" className="font-semibold flex items-center gap-2 px-6 py-3">
                        FINALIZAR <span aria-hidden>✓</span>
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
