import { useState } from "react";
import { MapPin, Users, Plus } from "lucide-react";
import { ClinicHeader } from "./components/ClinicHeader";
import { SettingsInputs } from "./components/SettingsInputs";
import { AddressCard } from "./components/AddressCard";
import { ProfessionalCard } from "./components/ProfessionalCard";
import { ProfessionalModal, type ProfessionalData } from "./components/ProfessionalModal";
import { LocationModal, type LocationData } from "./components/LocationModal";

// ── Types ────────────────────────────────────────────────────────────────────

type DayKey = "Dom" | "Seg" | "Ter" | "Qua" | "Qui" | "Sex" | "Sáb";

// ── Mock data ─────────────────────────────────────────────────────────────────

const initialAddresses: LocationData[] = [
  {
    id: "1",
    address: "Rua das Amendoeiras, nº 742",
    complement: "302, Bloco B",
    rooms: "4",
    scheduleType: "fixed",
    fixedDays: ["Seg", "Ter", "Qui", "Sex"],
    fixedStart: "08:00",
    fixedEnd: "20:00",
    flexibleSchedule: {
      Dom: { active: false, start: "09:00", end: "18:00" },
      Seg: { active: true, start: "08:00", end: "20:00" },
      Ter: { active: true, start: "08:00", end: "18:00" },
      Qua: { active: false, start: "09:00", end: "18:00" },
      Qui: { active: true, start: "09:00", end: "18:00" },
      Sex: { active: true, start: "10:00", end: "15:00" },
      Sáb: { active: false, start: "09:00", end: "18:00" },
    },
  },
  {
    id: "2",
    address: "Avenida Oceânica, nº 1289",
    complement: "Loja 05, Galeria Mar Azul",
    rooms: "2",
    scheduleType: "fixed",
    fixedDays: ["Seg", "Ter", "Qui", "Sex"],
    fixedStart: "08:00",
    fixedEnd: "20:00",
    flexibleSchedule: {
      Dom: { active: false, start: "09:00", end: "18:00" },
      Seg: { active: true, start: "08:00", end: "20:00" },
      Ter: { active: true, start: "08:00", end: "18:00" },
      Qua: { active: false, start: "09:00", end: "18:00" },
      Qui: { active: true, start: "09:00", end: "18:00" },
      Sex: { active: true, start: "10:00", end: "15:00" },
      Sáb: { active: false, start: "09:00", end: "18:00" },
    },
  },
];

// Map LocationData → AddressCard schedule prop
function toCardSchedule(loc: LocationData): Record<DayKey, { active: boolean; hours: string }> {
  const days: DayKey[] = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return Object.fromEntries(
    days.map((d) => {
      if (loc.scheduleType === "fixed") {
        const active = loc.fixedDays.includes(d);
        return [d, { active, hours: active ? `${loc.fixedStart.replace(":", "h")}–${loc.fixedEnd.replace(":", "h")}` : "" }];
      }
      const info = loc.flexibleSchedule[d];
      return [d, { active: info.active, hours: info.active ? `${info.start.replace(":", "h")}–${info.end.replace(":", "h")}` : "" }];
    })
  ) as Record<DayKey, { active: boolean; hours: string }>;
}

const initialProfessionals: ProfessionalData[] = [
  { id: "1", name: "Felipe Carneiro", phone: "(22) 98912-4442", email: "felipe.carneiro@gmail.com", role: "Administrador" },
  { id: "2", name: "Tiago Alves", phone: "(22) 98222-8585", email: "tiago.alves@gmail.com", role: "Profissional" },
  { id: "3", name: "Samanta Gomes", phone: "(23) 6411-8675", email: "samanta.alves@gmail.com", role: "Assistente" },
];

// ────────────────────────────────────────────────────────────────────────────

export const Configuracoes = () => {
  // ── Professionals state ────────────────────────────────────
  const [professionals, setProfessionals] = useState<ProfessionalData[]>(initialProfessionals);
  const [isProfModalOpen, setIsProfModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<ProfessionalData | null>(null);

  const openAddProfessional = () => {
    setEditingProfessional(null);
    setIsProfModalOpen(true);
  };

  const openEditProfessional = (pro: ProfessionalData) => {
    setEditingProfessional(pro);
    setIsProfModalOpen(true);
  };

  const handleSaveProfessional = (data: ProfessionalData) => {
    if (data.id) {
      setProfessionals((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    } else {
      setProfessionals((prev) => [...prev, { ...data, id: String(Date.now()) }]);
    }
  };

  // ── Addresses state ────────────────────────────────────────
  const [addresses, setAddresses] = useState<LocationData[]>(initialAddresses);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationData | null>(null);

  const openAddLocation = () => {
    setEditingLocation(null);
    setIsLocModalOpen(true);
  };

  const openEditLocation = (loc: LocationData) => {
    setEditingLocation(loc);
    setIsLocModalOpen(true);
  };

  const handleSaveLocation = (data: LocationData) => {
    if (data.id) {
      setAddresses((prev) => prev.map((a) => (a.id === data.id ? data : a)));
    } else {
      setAddresses((prev) => [...prev, { ...data, id: String(Date.now()) }]);
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      {/* Page header */}
      <header className="border-b border-b-[#DADCE0] h-full max-h-[80px] p-4 bg-white">
        <h1 className="text-2xl font-medium text-[#121535]">Configurações</h1>
      </header>

      <main className="p-6 md:p-10">
        {/* ── Clinic Header ─────────────────────────────────── */}
        <ClinicHeader
          name="Clínica Bem Estar"
          category="Empresa"
          cnpj="45.646.498/0001-00"
          area="Odontologia"
        />

        {/* ── Settings Inputs ────────────────────────────────── */}
        <SettingsInputs email="bem.estar@gmail.com" />

        <hr className="border-[#DADCE0] my-6" />

        {/* ── Addresses ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={18} className="text-[#121535]" />
            <h2 className="text-lg font-semibold text-[#121535]">Endereços</h2>
          </div>

          <div className="bg-white rounded-lg border border-[#DADCE0] px-6 py-2 shadow-sm">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                locationName={addr.complement ? addr.address.split(",")[0] : addr.address}
                street={addr.address}
                complement={addr.complement}
                rooms={Number(addr.rooms)}
                city={addr.id === "1" ? "Belo Horizonte" : "Florianópolis"}
                state={addr.id === "1" ? "MG" : "SC"}
                schedule={toCardSchedule(addr)}
                online
                homeVisit={addr.id === "1"}
                onEdit={() => openEditLocation(addr)}
              />
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <button
              className="flex items-center gap-2 bg-[#121535] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:brightness-110 transition-all cursor-pointer"
              onClick={openAddLocation}
            >
              <Plus size={15} />
              Adicionar novo local
            </button>
          </div>
        </section>

        <hr className="border-[#DADCE0] my-6" />

        {/* ── Professionals ─────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-[#121535]" />
            <h2 className="text-lg font-semibold text-[#121535]">Profissionais</h2>
          </div>

          <div className="flex flex-wrap gap-4">
            {professionals.map((pro) => (
              <ProfessionalCard
                key={pro.id}
                name={pro.name}
                phone={pro.phone}
                email={pro.email}
                role={pro.role}
                onEdit={() => openEditProfessional(pro)}
              />
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <button
              className="flex items-center gap-2 bg-[#121535] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:brightness-110 transition-all cursor-pointer"
              onClick={openAddProfessional}
            >
              <Plus size={15} />
              Adicionar profissional
            </button>
          </div>
        </section>

        <hr className="border-[#DADCE0] my-6" />
      </main>

      {/* ── Modals ───────────────────────────────────────────── */}
      <ProfessionalModal
        isOpen={isProfModalOpen}
        setIsOpen={setIsProfModalOpen}
        professional={editingProfessional}
        onSave={handleSaveProfessional}
      />

      <LocationModal
        isOpen={isLocModalOpen}
        setIsOpen={setIsLocModalOpen}
        location={editingLocation}
        onSave={handleSaveLocation}
      />
    </div>
  );
};
