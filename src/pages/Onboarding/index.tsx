import { useState } from "react";
import abstract from "../../assets/abstract_signup.png";
import { RenderStep } from "./renderSteps";

export const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      title: "Sobre sua clínica",
      description: "Queremos conhecer melhor seu negócio",
    },
    {
      step: 2,
      title: "Localização e Expediente",
      description: "Assim podemos agendar as consultas",
    },
    {
      step: 3,
      title: "Colaboradores",
      description: "Para finalizar, conecte os médicos da sua equipe",
    },
    {
      step: 4,
      title: "Serviços Oferecidos",
      description: "Defina o que oferece e seus preços",
    },
  ];

  const completedStepStyle = 'bg-green-400 !border-green-400 text-white';
  const currentStepStyle = 'bg-white';
  const upcomingStepStyle = 'bg-transparent text-white';

  return (
    <div className="min-h-screen w-full">
      <div className="flex w-full min-h-screen bg-white justify-between">
        <div
          className="hidden lg:flex flex-col justify-between max-w-[640px] w-full p-12 bg-cover bg-center border-r border-blue-400"
          style={{ backgroundImage: `url(${abstract})` }}
        >
            <h1 className="text-3xl font-semibold italic text-white mb-8">
              SCHED
            </h1>
          <div className="flex flex-col gap-6 h-[90%]">
            <h2 className="text-4xl font-semibold text-white mb-8">
              Vamos começar!
            </h2>
            <div className="flex flex-col gap-4 h-full">
              {steps.map((s) => {
                const connectorClass =
                  s.step < currentStep
                    ? "bg-green-400"
                    : s.step === currentStep
                    ? "bg-blue-500"
                    : "bg-white";

                return (
                  <div className="h-full flex flex-col gap-4" key={s.step}>
                    <div key={s.step} className="flex items-center gap-x-4">
                      <div
                        className={`w-10 h-10 rounded-full border-2 border-white ${s.step < currentStep ? completedStepStyle : s.step === currentStep ? currentStepStyle : upcomingStepStyle} flex items-center justify-center ${s.step === currentStep ? 'scale-105 shadow-lg' : ''} transition-all duration-300 ease-in-out`}
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
                    {s.step < steps.length && (
                      <div className={`h-full w-[1px] mx-5 ${connectorClass} transition-colors duration-500 ease-in-out`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center lg:px-8 px-4 py-12 relative w-full">
          <div className="flex w-full lg:w-fit mx-auto">
            <RenderStep step={currentStep} setStep={setCurrentStep} />
          </div>
        </div>
      </div>
    </div>
  );
};
