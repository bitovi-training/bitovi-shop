import { useRef, useState } from 'react';
import Icon, { ICON_VARIANTS } from '../Icon/Icon';
import './Input.css';

export default function Input({
  label,
  iconVariant,
  value,
  defaultValue = '',
  onChange,
  onValueChange,
  onClear,
  className = '',
  placeholder = 'Placeholder...',
  disabled = false,
  id,
  name,
  ...props
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const inputRef = useRef(null);

  const currentValue = isControlled ? value : internalValue;
  const hasValue = Boolean(currentValue && String(currentValue).length);

  const handleChange = (event) => {
    if (!isControlled) {
      setInternalValue(event.target.value);
    }

    if (onChange) {
      onChange(event);
    }

    if (onValueChange) {
      onValueChange(event.target.value, event);
    }
  };

  const handleClear = () => {
    const nextValue = '';

    if (!isControlled) {
      setInternalValue(nextValue);
    }

    if (onValueChange) {
      onValueChange(nextValue, null);
    }

    if (onChange) {
      onChange({
        target: { value: nextValue, id, name },
        currentTarget: { value: nextValue, id, name },
      });
    }

    if (onClear) {
      onClear();
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`text-input ${className}`.trim()}>
      {label ? <label className="text-input__label" htmlFor={id}>{label}</label> : null}

      <div className="text-input__field">
        <div className="text-input__left">
          {iconVariant ? (
            <span className="text-input__left-icon" aria-hidden="true">
              <Icon variant={iconVariant} />
            </span>
          ) : null}

          <input
            ref={inputRef}
            id={id}
            name={name}
            className="text-input__control"
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            value={currentValue}
            onChange={handleChange}
            {...props}
          />
        </div>

        {hasValue && !disabled ? (
          <button
            className="text-input__clear"
            type="button"
            onClick={handleClear}
            aria-label="Clear input"
          >
            <Icon variant={ICON_VARIANTS.CLOSE} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
