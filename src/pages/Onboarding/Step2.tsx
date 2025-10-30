import { Button } from "@/components/ui/button";
import CustomRadioInput from "@/components/CustomRadioInput";
import LocationFormsToAdd from "./LocationFormsToAdd";
import { House, MapPin, Plus, Globe} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Location } from "@/types";

interface Step2Props {
  singleLocationMode: boolean | null;
  setSingleLocationMode: (v: boolean | null) => void;
  locationForm: Location;
  setLocationForm: React.Dispatch<React.SetStateAction<Location>>;
  addOrUpdateLocation: () => void;
  emptyLocation: () => Location;
  onCancel: () => void;
  singleLocation: Location | null;
  editLocation: (loc: Location) => void;
  removeLocation: (id: string) => void;
  showLocationForm: boolean;
  setShowLocationForm: (v: boolean) => void;
  locations: Location[];
  setEditingLocation: React.Dispatch<React.SetStateAction<Location | null>>;
  step: number;
  prevStep: () => void;
  setStep: (step: number | ((prev: number) => number)) => void;

  headerLeft?: React.ReactNode;
  initialAttendWorkspace?: boolean;
}

export default function Step2({
  step,
  setStep,
  singleLocationMode,
  setSingleLocationMode,
  locationForm,
  setLocationForm,
  addOrUpdateLocation,
  emptyLocation,
  onCancel,
  singleLocation,
  editLocation,
  removeLocation,
  showLocationForm,
  setShowLocationForm,
  locations,
  setEditingLocation,
  initialAttendWorkspace,
  headerLeft,
}: Step2Props) {
  const [attendHome, setAttendHome] = useState(false);
  const [attendOnline, setAttendOnline] = useState(false);
  const [attendWorkspace, setAttendWorkspace] = useState(
    Boolean(initialAttendWorkspace)
  );
  const [animateIn, setAnimateIn] = useState(false);
  const questionRef = useRef<HTMLDivElement | null>(null);

  const initialMountRef = useRef(true);

  void step;
  void setStep;

  const showLocationsQuestion = attendWorkspace;

  useEffect(() => {
    if (showLocationsQuestion && questionRef.current) {
     
      if (initialMountRef.current) {
        setAnimateIn(true);
        initialMountRef.current = false;
        return;
      }
      setAnimateIn(false);
      questionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      const t = setTimeout(() => setAnimateIn(true), 160);
      return () => clearTimeout(t);
    }
    if (!showLocationsQuestion) setAnimateIn(false);
  }, [showLocationsQuestion]);

  return (
    <>
      <div className="mb-2 flex flex-col items-start">
        {headerLeft && <div className="mb-3">{headerLeft}</div>}
        <div>
          <h4 className="font-semibold text-lg text-[30px]">Onde você atende?</h4>
          <p className="text-muted-foreground text-[20px] mb-2">
            Cadastre os locais de atendimento.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 h-full">
  <div className="flex flex-col items-center gap-[25px] mt-2 mb-2 md:flex-row md:flex-wrap md:justify-between h-fit">
          <label className={`relative flex items-start gap-2 border p-6 rounded-lg w-[80%] md:flex-1 md:min-w-[220px] md:max-w-[32%] mx-auto cursor-pointer hover:shadow-[3px_4px_35px_#0015fc2b] transition duration-200 ${attendWorkspace ? 'border-[#141736]' : 'border-gray-400'}`}>
            <Checkbox
              className="sr-only"
              checked={attendWorkspace}
              onCheckedChange={(v) => setAttendWorkspace(Boolean(v))}
            />
            <div className={`flex flex-col w-full justify-center text-center gap-4 transition-colors duration-200 ease-in-out ${attendWorkspace ? 'text-[#141736]' : 'text-[#A8A7A7]'}`}>
              <span className="select-none font-semibold text-[20px]">Consultório</span>
              <MapPin className="self-center text-black" size={48} />
            </div>
            <div className={`absolute top-4 right-4 h-5 w-5 rounded-full border ${attendWorkspace ? 'bg-[#141736] border-[#141736]' : 'bg-white border-gray-500'}`} />
          </label>
          <label className={`relative flex items-start gap-2 border p-6 rounded-lg w-[80%] md:flex-1 md:min-w-[220px] md:max-w-[32%] mx-auto cursor-pointer hover:shadow-[3px_4px_35px_#0015fc2b] transition duration-200 ${attendOnline ? 'border-[#141736]' : 'border-gray-400'}`}>
            <Checkbox
              className="sr-only"
              checked={attendOnline}
              onCheckedChange={(v) => setAttendOnline(Boolean(v))}
            />
            <div className={`flex flex-col w-full justify-center text-center gap-4 transition-colors duration-200 ease-in-out ${attendOnline ? 'text-[#141736]' : 'text-[#A8A7A7]'}`}>
              <span className="select-none font-semibold text-[20px]">Online</span>
              <Globe className="self-center text-black" size={48} />
            </div>
            <div className={`absolute top-4 right-4 h-5 w-5 rounded-full border ${attendOnline ? 'bg-[#141736] border-[#141736]' : 'bg-white border-gray-500'}`} />
          </label>
          <label className={`relative flex items-start gap-2 border p-6 rounded-lg w-[80%] md:flex-1 md:min-w-[220px] md:max-w-[32%] mx-auto cursor-pointer hover:shadow-[3px_4px_35px_#0015fc2b] transition duration-200 ${attendHome ? 'border-[#141736]' : 'border-gray-400'}`}>
            <Checkbox
              className="sr-only"
              checked={attendHome}
              onCheckedChange={(v) => setAttendHome(Boolean(v))}
            />
            <div className={`flex flex-col w-full justify-center text-center gap-4 transition-colors duration-200 ease-in-out ${attendHome ? 'text-[#141736]' : 'text-[#A8A7A7]'}`}>
              <span className="select-none font-semibold text-[20px]">A domicilio</span>
              <House className="self-center text-black" size={48} />
            </div>
            <div className={`absolute top-4 right-4 h-5 w-5 rounded-full border ${attendHome ? 'bg-[#141736] border-[#141736]' : 'bg-white border-gray-500'}`} />
          </label>
        </div>

        {showLocationsQuestion ? (
          <div
            ref={questionRef}
            className={`transition-opacity duration-300 ease-in-out ${
              animateIn ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="font-semibold mb-2">
              Em quantos locais você realiza atendimentos?
            </p>
            <div className="flex gap-4">
              <CustomRadioInput
                label="Local Único"
                htmlFor="single-local"
                name="locationsMode"
                iconName="enterprise"
                value="single"
                checked={singleLocationMode === true}
                subtitle="Uso apenas um endereço principal"
                onChange={() => {
                  setSingleLocationMode(true);
                  setShowLocationForm(false);
                  setEditingLocation(null);
                }}
              />
              <CustomRadioInput
                label="Em múltiplos locais"
                htmlFor="multiple-locals"
                name="locationsMode"
                iconName="companies"
                value="multiple"
                checked={singleLocationMode === false}
                subtitle="Tenho mais de um local de atendimento"
                onChange={() => {
                  setSingleLocationMode(false);
                  setShowLocationForm(false);
                  setEditingLocation(null);
                }}
              />
            </div>
            <div>
              {singleLocationMode && !singleLocation ? (
                <div className="mt-8">
                  <LocationFormsToAdd
                    multipleLocations={false}
                    locationForm={locationForm}
                    setLocationForm={setLocationForm}
                    addOrUpdateLocation={addOrUpdateLocation}
                    emptyLocation={emptyLocation}
                    onCancel={onCancel}
                  />
                </div>
              ) : singleLocationMode && singleLocation ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center border p-2 rounded-lg mb-4">
                    <div>
                      <p className="font-semibold">
                        {singleLocation.name ||
                          `${singleLocation.address} ${singleLocation.number}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {singleLocation.city} / {singleLocation.state}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editLocation(singleLocation)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLocation(singleLocation.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}

              {!singleLocationMode && (
                <div className="flex flex-col justify-between h-full max-h-[95%]">
                  {locations.length === 0 || showLocationForm ? null : (
                    <div className="overflow-y-auto h-[336px] custom-scrollbar">
                      {!showLocationForm &&
                        locations.map((loc) => (
                          <div
                            key={loc.id}
                            className="flex justify-between items-center border p-2 rounded-lg mb-4"
                          >
                            <div>
                              <p className="font-semibold">
                                {loc.name || `${loc.address} ${loc.number}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {loc.city} / {loc.state}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => editLocation(loc)}
                              >
                                Editar
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLocation(loc.id)}
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {(showLocationForm || locations.length === 0) && (
                    <div className="mt-8">
                      <LocationFormsToAdd
                        multipleLocations={true}
                        locationForm={locationForm}
                        setLocationForm={setLocationForm}
                        addOrUpdateLocation={addOrUpdateLocation}
                        emptyLocation={emptyLocation}
                        onCancel={onCancel}
                      />
                    </div>
                  )}
                  {!showLocationForm &&
                    !singleLocationMode &&
                    locations.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button
                          className="!text-[16px] font-medium px-2"
                          type="button"
                          onClick={() => {
                            setEditingLocation(null);
                            setLocationForm(emptyLocation());
                            setShowLocationForm(true);
                          }}
                        >
                          <Plus />
                          Adicionar Novo Local
                        </Button>
                        {locations.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {locations.length === 1
                              ? `${locations.length} local adicionado`
                              : `${locations.length} locais adicionados`}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
