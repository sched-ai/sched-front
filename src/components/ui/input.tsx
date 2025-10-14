import { type InputHTMLAttributes, type ReactElement, forwardRef } from "react";
import InputMask from "react-input-mask";

import classNames from "classnames";

import type { TError } from "@/types";

export type InputType =
  | "text"
  | "number"
  | "e-mail"
  | "password"
  | "textarea"
  | "date"
  | "time"
  | "mask"
  | "currency";

interface IProps
  extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  type: InputType;
  subtitle?: string;
  mask?: string;
  rightBtnAction?: () => void;
  rightIconComponent?: ReactElement;
  leftIconComponent?: ReactElement;
  className?: string;
  supportText?: string;
  error?: TError<IProps["name"]>;
  supportTextClassName?: string;
  multiline?: boolean;
  tooltipMessage?: string;
  isRequired?: boolean;
}

export const Input = forwardRef<unknown, IProps>((props, ref) => {
  const {
    mask,
    rightBtnAction,
    rightIconComponent,
    error,
    className,
    supportText,
    label,
    type,
    leftIconComponent,
    disabled,
    supportTextClassName,
    // tooltipMessage,
    isRequired,
    subtitle,
    ...fieldProps
  } = props;

  const styles = {
    wrapper: "flex flex-col relative h-full",
    input: {
      base: "w-full transition-all h-10 border border-secondary-l px-4 py-6 font-[600] bg-white/12 text-body-lg text-paragraph-high transition durantion-200 outline-none hover:text-[#141736] focus:text-[#141736] text-secondary-l rounded-[10px] border-[#A2A6BB66] hover:border-[#141736] focus:border-[#141736]",
      placeholder:
        "placeholder:text-body-lg placeholder:text-gray-300 placeholder:font-normal font-thin",
      filled: "",
      disabled:
        "cursor-not-allowed !bg-[#0505051A] !text-secondary-l !border-[#0505051A]",
      invalid: "!border-danger-d",
      leftIcon: "!pl-10",
      multiline:
        "resize-none !py-4 min-h-[66px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:block overflow-y-auto [&::-webkit-scrollbar-track]:mt-2 [&::-webkit-scrollbar-track]:mb-2",
    },
    label: {
      base: "font-medium text-[16px] text-[#384455]",
      invalid: "!text-danger-d !mb-0",
    },
    support_text: {
      base: "text-sm text-[#384455] ml-2 mt-1",
      invalid: "!text-danger-d ",
    },
    left_icon: "absolute left-3 bottom-3",
    right_icon: {
      base: "cursor-pointer hover:opacity-70 transition absolute right-3 bottom-5",
      icon: "cursor-pointer",
    },
    currency_prefix:
      "absolute left-3 bottom-[20px] font-semibold text-gray-500",
    tooltip: "absolute right-0 top-0",
    input_wrapper: "relative",
  };

  const mask_input_props = {
    ...fieldProps,
    ref,
    disabled,
    type: "text",
    mask: mask || "",
    className: classNames(styles.input.base, styles.input.placeholder, {
      [styles.input.disabled]: disabled,
      [styles.input.invalid]: error !== undefined,
      [styles.input.filled]: props.value !== "",
      [styles.input.leftIcon]: leftIconComponent !== undefined,
    }),
  };

  const input_props = {
    ...fieldProps,
    ref,
    type,
    disabled,
    className: classNames(styles.input.base, {
      [styles.input.disabled]: disabled,
      [styles.input.invalid]: error !== undefined,
      [styles.input.filled]: props.value !== "",
      [styles.input.leftIcon]: leftIconComponent !== undefined,
      [styles.input.multiline]: props.multiline,
      "min-h-[130px] !py-4": type === "textarea",
    }),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputs: any = {
    mask: {
      tag: InputMask,
      input_props: mask_input_props,
    },
    textarea: {
      tag: "textarea",
      input_props: {
        ...input_props,
        rows: 4,
      },
    },
    text: {
      tag: props.multiline ? "textarea" : "input",
      input_props: {
        ...input_props,
        rows: props.multiline ? 4 : undefined,
      },
    },
    number: {
      tag: "input",
      input_props: {
        ...input_props,
        step: "any",
        className: classNames(input_props.className, "no-arrows"),
        onWheel: (e: React.WheelEvent<HTMLInputElement>) =>
          e.currentTarget.blur(),
      },
    },
    "e-mail": {
      tag: "input",
      input_props,
    },
    password: {
      tag: "input",
      input_props,
    },
    date: {
      tag: "input",
      input_props,
    },
    time: {
      tag: "input",
      input_props,
    },
    currency: {
      tag: "input",
      input_props: {
        ...input_props,
        type: "text",
        className: classNames(input_props.className, "pl-10"),
        inputMode: "decimal",
        pattern: "[0-9]*",
      },
    },
  };

  const InputTag = inputs[type].tag;
  const input_tag_props = inputs[type].input_props;

  return (
    <div className={classNames("w-full h-full", className)}>
      <div className={styles.wrapper}>
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label
              className={classNames(styles.label.base, {
                [styles.label.invalid]: error !== undefined,
                "!mb-0": true,
              })}
              htmlFor={fieldProps.name}
            >
              {label}
              {fieldProps.required ||
                (isRequired && (
                  <span className="text-danger-d text-[16px] ml-1">*</span>
                ))}

              <p className="text-gray-400 text-[12px]">{subtitle}</p>
            </label>

            {/* {tooltipMessage && (
						<InfoTooltip
            title={label}
            message={tooltipMessage}
						/>
            )} */}
          </div>
        )}
        <div className={styles.input_wrapper}>
          {type === "currency" && (
            <span className={styles.currency_prefix}>R$</span>
          )}
          {leftIconComponent && (
            <div className={styles.left_icon}>{leftIconComponent}</div>
          )}
          <InputTag id={fieldProps.name} {...input_tag_props} />
          {rightIconComponent !== undefined && (
            <button
              type="button"
              onClick={() => (rightBtnAction ? rightBtnAction() : null)}
              className={classNames(styles.right_icon.base, {
                [styles.right_icon.icon]: rightBtnAction !== undefined,
              })}
            >
              {rightIconComponent}
            </button>
          )}
        </div>
        {supportText && (
          <p
            className={classNames(
              supportTextClassName,
              styles.support_text.base,
              {
                [styles.support_text.invalid]: error !== undefined,
              }
            )}
          >
            {supportText}
          </p>
        )}
      </div>
    </div>
  );
});

export default Input;
