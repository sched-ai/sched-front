import abstract from "../../assets/abstract_waves.jpg";
import { RenderStep } from "./renderSteps";


export const Onboarding = () => {
  

  return (
    <div className="min-h-screen w-full">
      <div className="flex w-full min-h-screen bg-white justify-between">
        <div
          className="hidden lg:flex flex-col justify-between max-w-[640px] w-full p-12 bg-cover bg-center border-r border-blue-400"
          style={{ backgroundImage: `url(${abstract})` }}
        >
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-semibold italic text-white mb-8">
              SCHED
            </h1>
            <h2 className="text-4xl font-light text-white mb-2">
              Vamos começar!
            </h2>
            <div>
              <div>
                <div className="w-10 h-10 rounded-full bg-white"></div>
                <h5></h5>
                <p></p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center lg:px-8 px-4 py-12 relative w-full">
          <div className="flex w-full lg:w-fit mx-auto">
            <div className="hidden lg:flex flex-col justify-center">
              <div className="w-[1px] bg-blue-500 mr-20 rounded-full h-[60vh]" />
            </div>
            <RenderStep />
          </div>
        </div>
        <span></span>
      </div>
    </div>
  );
};
