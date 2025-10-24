import { Button } from "@/components/ui/button";
import CustomRadioInput from "@/components/CustomRadioInput";
import LocationFormsToAdd from "./LocationFormsToAdd";
import { Building, Building2, Plus } from "lucide-react";
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
}

export default function Step2({
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
}: Step2Props) {
  return (
    <>
      <div className="mb-8">
        <h4 className="mb-0 font-semibold text-lg text-[24px]">Onde você atende?</h4>
        <p className="text-muted-foreground text-[16px]">Cadastre os locais físicos onde você realiza atendimentos.</p>
      </div>
      <div className="flex flex-col gap-4 h-full">
        <p className="font-semibold">Em quantos locais você realiza atendimentos?</p>
        <div className="flex gap-4">
          <CustomRadioInput
            label="Em um único local"
            htmlFor="single-local"
            name="locationsMode"
            Icon={Building}
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
            Icon={Building2}
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
        <div className="h-full">
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
                  <p className="font-semibold">{singleLocation.name || `${singleLocation.address} ${singleLocation.number}`}</p>
                  <p className="text-sm text-muted-foreground">{singleLocation.city} / {singleLocation.state}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => editLocation(singleLocation)}>Editar</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeLocation(singleLocation.id)}>Remover</Button>
                </div>
              </div>
            </div>
          ) : null}

          {!singleLocationMode && (
            <div className="flex flex-col justify-between h-full">
              {locations.length === 0 || showLocationForm ? null : (
                <div className="overflow-y-auto h-[336px] custom-scrollbar">
                  {!showLocationForm && locations.map((loc) => (
                    <div key={loc.id} className="flex justify-between items-center border p-2 rounded-lg mb-4">
                      <div>
                        <p className="font-semibold">{loc.name || `${loc.address} ${loc.number}`}</p>
                        <p className="text-sm text-muted-foreground">{loc.city} / {loc.state}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => editLocation(loc)}>Editar</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeLocation(loc.id)}>Remover</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showLocationForm || locations.length === 0 && (
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
              {!showLocationForm && !singleLocationMode && locations.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button className="!text-[16px] font-medium px-2" type="button" onClick={() => { setEditingLocation(null); setLocationForm(emptyLocation()); setShowLocationForm(true); }}>
                    <Plus />
                    Adicionar Novo Local
                  </Button>
                  {locations.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {locations.length === 1 ? `${locations.length} local adicionado` : `${locations.length} locais adicionados`}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
