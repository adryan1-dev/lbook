import { useId, useState } from "react";
import { Eye, EyeOff } from "./icons";

function PasswordField({
  label,
  name,
  value,
  onChange,
  autoComplete,
  className,
  required = true,
  minLength = 6,
}) {
  const inputId = useId();
  const [visible, setVisible] = useState(false);
  const showLabel = visible ? "Ocultar senha" : "Mostrar senha";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-ink-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className={`${className} pr-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={showLabel}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-ink-500 transition duration-150 ease-out hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-mist-600"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export default PasswordField;
