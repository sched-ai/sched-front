import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Location } from "@/types";
import { useEffect, useState } from "react";
import axios from "axios";

export const LocationFormsToAdd = ({
  multipleLocations,
  locationForm,
  setLocationForm,
  addOrUpdateLocation,
  emptyLocation,
  onCancel,
}: {
  multipleLocations: boolean;
  locationForm: Location;
  setLocationForm: (fn: Location | ((prev: Location) => Location)) => void;
  addOrUpdateLocation: () => void;
  emptyLocation: () => Location;
  onCancel?: () => void;
}) => {
  const [states, setStates] = useState<{ sigla: string; nome: string }[]>([]);
  const [cities, setCities] = useState<{ nome: string }[]>([]);
  
  const [stateSearchText, setStateSearchText] = useState("");
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);

  const [citySearchText, setCitySearchText] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  useEffect(() => {
    // Fetch states
    axios
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((res) => setStates(res.data))
      .catch((err) => console.error("Error fetching states:", err));
  }, []);

  useEffect(() => {
    if (locationForm.state) {
      // Fetch cities by state acronym
      axios
        .get(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${locationForm.state}/municipios?orderBy=nome`
        )
        .then((res) => setCities(res.data))
        .catch((err) => console.error("Error fetching cities:", err));
    } else {
      setCities([]);
    }
  }, [locationForm.state]);

  useEffect(() => {
    if (locationForm.state && states.length > 0) {
      const found = states.find((s) => s.sigla === locationForm.state);
      if (found) setStateSearchText(found.nome);
    } else if (!locationForm.state) {
      setStateSearchText("");
    }
  }, [locationForm.state, states]);

  useEffect(() => {
    setCitySearchText(locationForm.city || "");
  }, [locationForm.city]);

  return (
    <div className="border rounded-lg p-4 relative">
      {multipleLocations && (
        <p className="font-semibold bg-white absolute -top-4 left-2 py-1 px-2">
          Adicionar Local:
        </p>
      )}
      <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mt-4">
        <Input
          type="text"
          label="Endereço (Rua)"
          value={locationForm.address}
          onChange={(e) =>
            setLocationForm((p: Location) => ({
              ...p,
              address: e.target.value,
            }))
          }
          required
          isRequired
        />
         <Input
          type="text"
          label="Número"
          value={locationForm.number}
          onChange={(e) =>
            setLocationForm((p: Location) => ({
              ...p,
              number: e.target.value,
            }))
          }
          required
          isRequired
        />
         <Input
          type="text"
          label="Complemento (opcional)"
          value={locationForm.complement}
          onChange={(e) =>
            setLocationForm((p: Location) => ({
              ...p,
              complement: e.target.value,
            }))
          }
        />
        <div className="space-y-2 relative">
          <Input
            type="text"
            label="Estado"
            placeholder="Buscar estado"
            value={stateSearchText}
            onChange={(e) => {
              const val = e.target.value;
              setStateSearchText(val);
              if (!val) {
                 setLocationForm((p: Location) => ({ ...p, state: "", city: "" }));
                 setCitySearchText("");
              }
            }}
            onFocus={() => setShowStateSuggestions(true)}
            onBlur={() => setTimeout(() => setShowStateSuggestions(false), 200)}
            required
            isRequired
          />
          {showStateSuggestions && states.length > 0 && (
             <div className="absolute top-[82px] left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                 <ul>
                     {states
                        .filter(st => st.nome.toLowerCase().includes(stateSearchText.toLowerCase()) || st.sigla.toLowerCase().includes(stateSearchText.toLowerCase()))
                        .map((st) => (
                         <li 
                             key={st.sigla}
                             className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-[#141736]"
                             onMouseDown={(e) => {
                                 e.preventDefault();
                                 setStateSearchText(st.nome);
                                 setLocationForm((p: Location) => ({ ...p, state: st.sigla, city: "" }));
                                 setShowStateSuggestions(false);
                             }}
                         >
                             {st.nome} - {st.sigla}
                         </li>
                     ))}
                 </ul>
             </div>
          )}
        </div>

        <div className="space-y-2 relative">
          <Input
            type="text"
            label="Cidade"
            placeholder={locationForm.state ? "Buscar cidade" : "Escolha o estado primeiro"}
            disabled={!locationForm.state}
            value={citySearchText}
            onChange={(e) => {
              const val = e.target.value;
               setCitySearchText(val);
               if (!val) setLocationForm((p: Location) => ({ ...p, city: "" }));
            }}
            onFocus={() => setShowCitySuggestions(true)}
            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
            required
            isRequired
          />
          
          {showCitySuggestions && cities.length > 0 && (
                              
             <div className="absolute top-[82px] left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                 <ul>
                     {cities
                        .filter(c => c.nome.toLowerCase().includes(citySearchText.toLowerCase()))
                        .map((city, idx) => (
                         <li 
                             key={`${city.nome}-${idx}`}
                             className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-[#141736]"
                             onMouseDown={(e) => {
                                 e.preventDefault();
                                 setCitySearchText(city.nome);
                                 setLocationForm((p: Location) => ({ ...p, city: city.nome }));
                                 setShowCitySuggestions(false);
                             }}
                         >
                             {city.nome}
                         </li>
                     ))}
                 </ul>         
             </div>
          )}
        </div>
                  <Input
                   type="text"
                   label="Bairro"
                   value={locationForm.neighborhood || ""}
                   onChange={(e) =>
                     setLocationForm((p: Location) => ({
                       ...p,
                       neighborhood: e.target.value,
                     }))
                   }
                   required
                   isRequired
                 />
       
        <Input
          type="text"
          label="Apelido do Local"
          value={locationForm.name}
          onChange={(e) =>
            setLocationForm((p: Location) => ({
              ...p,
              name: e.target.value,
            }))
          }
          tooltipMessage="Este campo se refere a como este endereço será chamado no sistema para facilitar suas interações."
          required
          isRequired
        />
      </div>
      {multipleLocations && (
        <div className="flex gap-2 mt-3 justify-end">
          <Button
            type="button"
            variant="outline"
            className="px-4 font-medium"
            onClick={() => {
              if (multipleLocations && onCancel) {
                onCancel();
                return;
              }
              setLocationForm(emptyLocation());
            }}
          >
            {multipleLocations ? "Cancelar" : "Limpar"}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    type="button"
                    onClick={() => {
                      addOrUpdateLocation();
                    }}
                    className="px-4 font-medium !text-[14px]"
                    disabled={
                      !locationForm.address ||
                      !locationForm.neighborhood ||
                      !locationForm.number ||
                      !locationForm.city ||
                      !locationForm.state ||
                      (multipleLocations ? !locationForm.name : false)
                    }
                  >
                    Adicionar local
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preencha todos os campos obrigatórios para salvar o local.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

export default LocationFormsToAdd;
