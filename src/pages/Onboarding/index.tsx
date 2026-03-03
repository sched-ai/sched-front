import { useState, useEffect } from "react";
import abstract from "../../assets/abstract_dark.png";
import { RenderStep } from "./renderSteps";
import logo from "@/assets/logo.png";
import { useUser } from "@/context/user";
import LoadingScreen from "../LoadingScreen";
import { logout } from "@/services/storage";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Onboarding = () => {
  const { userData, userLoading } = useUser();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof userData?.onboardingStep === "number") {
      const step = userData.onboardingStep === 0 ? 1 : userData.onboardingStep;
      setCurrentStep(step);
    }
  }, [userData?.onboardingStep]);

  const steps = [
    {
      step: 1,
      title: "Sobre seu negócio",
      description: "Queremos conhecer melhor seu negócio",
    },
    {
      step: 2,
      title: "Localização",
      description: "Onde você atende seus clientes",
    },
    {
      step: 3,
      title: "Expediente",
      description: "Assim podemos agendar seus atendimentos corretamente",
    },
     {
      step: 4,
      title: "Colaboradores",
      description: "Adicione sua equipe ao Sched",
    },
    {
      step: 5,
      title: "Serviços Oferecidos",
      description: "Defina o que oferece e seus preços",
    },
  ];

  const completedStepStyle = 'bg-green-400 !border-green-400 text-white';
  const currentStepStyle = 'bg-white';
  const upcomingStepStyle = 'bg-transparent text-white';

  if (userLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen w-full">
      <div className="flex w-full h-screen bg-white justify-between">
        <div
          className="hidden lg:flex flex-col justify-between max-w-[640px] w-full xl:p-6 pl-6 pt-6 bg-cover bg-center border-r border-blue-400 h-screen animated-bg animated-bg--slow"
          style={{ backgroundImage: `url(${abstract})` }}
        >
            <img className="w-15 mb-10" src={logo} alt="logo do sched em cor branca" />
          <div className="flex flex-col gap-6 h-[90%]">
            <h2 className="text-4xl font-semibold text-white mb-8">
              Vamos começar!
            </h2>
            <div className="flex flex-col gap-4 h-full">
              {steps.map((s, idx) => {
                const isCompleted = s.step < currentStep;
                const isCurrent = s.step === currentStep;

                const connectorClass = isCompleted
                  ? "bg-green-400"
                  : isCurrent && s.step > 1
                  ? "bg-blue-500"
                  : "bg-white";

                return (
                  <div className="h-full flex flex-col gap-4" key={s.step}>
                    <div className="flex items-center gap-x-4">
                      <div
                        className={`w-10 h-10 rounded-full border-2 border-white ${isCompleted ? completedStepStyle : isCurrent ? currentStepStyle : upcomingStepStyle} flex items-center justify-center ${isCurrent ? 'scale-105 shadow-lg' : ''} transition-all duration-300 ease-in-out`}
                      >
                        <span className="font-semibold leading-0">{s.step}</span>
                      </div>
                      <div>
                        <h5 className="text-white font-semibold text-2xl">
                          {s.title}
                        </h5>
                        <p className="text-white font-light italic">{s.description}</p>
                      </div>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`h-full w-[1px] mx-5 ${connectorClass} transition-colors duration-500 ease-in-out`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <button
            className="flex items-center font-medium gap-3 text-red-500 p-3 border-l-4 rounded-none justify-start hover:text-white border-transparent cursor-pointer hover:bg-[#0177FB]/10 w-fit mb-4"
            onClick={() => {
              logout();
              navigate("/signin");
            }}
          >
            <LogOut />
            <span>Sair</span>
          </button>
        </div>
        <div className="flex flex-col xl:justify-center p-6 relative w-full overflow-y-auto h-full max-h-screen">
          <div className="flex w-full mx-auto justify-center h-full">
            <RenderStep step={currentStep} setStep={setCurrentStep} />
          </div>
        </div>
      </div>
    </div>
  );
};
