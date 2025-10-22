import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Location } from "@/types";

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
  return (
    <div className="border rounded-lg p-4 mt-4 relative">
      <p className="font-semibold bg-white absolute -top-4 left-2 py-1 px-2">
        Adicionar Local:
      </p>
      <p className="font-medium"></p>
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
          label="Estado"
          value={locationForm.state}
          onChange={(e) =>
            setLocationForm((p: Location) => ({
              ...p,
              state: e.target.value,
            }))
          }
          required
          isRequired
        />
        <Input
          type="text"
          label="Cidade"
          value={locationForm.city}
          onChange={(e) =>
            setLocationForm((p: Location) => ({
              ...p,
              city: e.target.value,
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
          className="md:col-span-2"
        />
        {multipleLocations && (
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
        )}
      </div>
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
    </div>
  );
};

export default LocationFormsToAdd;
