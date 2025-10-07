import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "../../lib/utils"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    if (type !== "password") {
      return (
        <input
          type={type}
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:text-primary-foreground border-black flex w-full min-w-0 rounded-md border bg-transparent px-4 py-3 text-base shadow-xs transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-600",
            "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
      )
    }

    const togglePasswordVisibility = () => setShowPassword(!showPassword)

    return (
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "pr-10 file:text-foreground placeholder:text-muted-foreground selection:text-primary-foreground border-black flex w-full min-w-0 rounded-md border bg-transparent px-4 py-3 text-base shadow-xs transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible:ring-2 focus-visible:border-blue-500 focus-visible:ring-blue-600",
            "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center p-3 text-muted-foreground"
          aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Eye className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }