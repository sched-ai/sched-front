interface ClinicHeaderProps {
  name?: string;
  category?: string;
  cnpj?: string | null;
  photoUrl?: string;
}

export const ClinicHeader = ({
  name,
  category,
  cnpj,
  photoUrl,
}: ClinicHeaderProps) => {
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
         {category}&nbsp;&nbsp;|&nbsp;&nbsp;Documento: {cnpj}&nbsp;&nbsp;
        </p>
      </div>
    </div>
  );
};
