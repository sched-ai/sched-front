import type {
  ForwardRefExoticComponent,
  RefAttributes,
  ChangeEventHandler,
  MouseEventHandler,
} from "react";

import { type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";
import SharedIcon from "@/components/Icon";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface CustomRadioInputProps {
  label: string;
  htmlFor: string;
  image?: string;
  Icon?: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  /**
  Use um ícone do arquivo index.tsx pelo nome.
  Exemplo: iconName="person" ou iconName="enterprise".
  Quando fornecido, iconName tem prioridade sobre a prop Icon do componente.
   */
  iconName?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  checked?: boolean;
  name: string;
  omit_radio?: boolean;
  value?: string;
  onClick?: MouseEventHandler<HTMLLabelElement>;
  subtitle?: string;
  disabled?: boolean;
  disabledTooltip?: string;
}

const CustomRadioInput = (props: CustomRadioInputProps) => {
  const {
    label,
    htmlFor,
    image,
    Icon,
    iconName,
    checked,
    name,
    omit_radio,
    value,
    onChange,
    onClick,
    subtitle,
    disabled,
    disabledTooltip,
  } = props;

  const content = (
    <label
      onClick={!disabled ? onClick : undefined}
      htmlFor={htmlFor}
      className={cn(
        "p-4 border-2 custom-2md:h-[81px] m-auto sm:m-0 w-full border-[#E1E1E1] rounded-md h-full flex items-center relative transition-all group",
        {
          "border-[#141736]": checked && !disabled,
          "cursor-pointer hover:shadow-[3px_4px_35px_#1417362B]": !disabled,
          "cursor-not-allowed opacity-50": disabled,
        }
      )}
    >
      <div className="flex items-center gap-x-4">
        {iconName ? (
          <SharedIcon name={iconName} size={20} className="w-6 h-6 fill-[#141736]" />
        ) : (
          Icon && <Icon className="w-6 h-6" color="#141736" />
        )}
        {image && <img src={image} className="sm:w-9 w-6" />}
        <div>
          <p
            className={cn("text-[16px]", {
              "text-[#141736]": checked && !disabled,
            })}
          >
            {label}
          </p>
          <p className="text-[14px] text-[#A8A7A7]">{subtitle}</p>
        </div>
      </div>
      <input
        type="radio"
        name={name}
        id={htmlFor}
        className="hidden peer"
        onChange={onChange}
        checked={checked}
        value={value}
        disabled={disabled}
      />
      {!omit_radio && (
        <div
          className={cn(
            "flex items-center justify-center absolute top-4 right-4 h-6 w-6 rounded-full bg-[#F9F9F9] border-2 border-gray-200 transition-all",
            {
              "peer-checked:bg-primary group-hover:bg-primary": !disabled,
              "bg-gray-200": disabled && checked,
            }
          )}
        >
          <div className="bg-[#F9F9F9] flex h-2 w-2 rounded-full" />
        </div>
      )}
    </label>
  );

  if (disabled && disabledTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>{disabledTooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

export default CustomRadioInput;
