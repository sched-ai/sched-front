import { formatCpf, formatCnpj } from "@/util/helper";

interface ClinicHeaderProps {
  name?: string;
  category?: string;
  document?: string | null;
  photoUrl?: string;
}

export const ClinicHeader = ({
  name,
  category,
  document,
  photoUrl,
}: ClinicHeaderProps) => {
  const formatDocumentDisplay = (doc?: string | null) => {
    if (!doc) return "";
    const cleanDoc = doc.replace(/\D/g, "");
    if (cleanDoc.length === 11) return formatCpf(cleanDoc);
    if (cleanDoc.length === 14) return formatCnpj(cleanDoc);
    return doc;
  };

  return (
    <div className="flex items-center gap-6 py-4">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#121535] flex items-center justify-center">
            <span className="text-white text-3xl font-semibold">
              {name?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[#121535] text-xl font-semibold">{name}</h2>
        </div>
        <p className="text-gray-500 text-sm">
         Tipo de usuário: {category}&nbsp;&nbsp;|&nbsp;&nbsp;Documento: {formatDocumentDisplay(document)}&nbsp;&nbsp;
        </p>
      </div>
    </div>
  );
};
