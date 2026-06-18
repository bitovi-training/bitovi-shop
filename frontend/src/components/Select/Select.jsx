import { useState } from 'react';
import Icon, { ICON_VARIANTS } from '../Icon/Icon';
import './Select.css';

export default function Select({
  id,
  name,
  label,
  iconVariant,
  options = [],
  value,
  defaultValue = '',
  placeholder = 'value',
  disabled = false,
  className = '',
  ariaLabel,
  onChange,
  onValueChange,
  ...props
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? value : internalValue;

  const normalizedOptions = options.map((option) =>
    typeof option === 'string'
      ? { value: option, label: option }
      : { value: option.value, label: option.label }
  );

  const selectedLabel =
    normalizedOptions.find((o) => o.value === currentValue)?.label || null;

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

  return (
    <div className={`select-field ${className}`.trim()}>
      {label ? (
        <label className="select-field__label" htmlFor={id}>
          {label}
        </label>
      ) : null}

      <div className="select-field__selection">
        {/* Invisible native select stretched over the entire container */}
        <select
          id={id}
          name={name}
          className="select-field__control select-field__control--overlay"
          disabled={disabled}
          aria-label={label ? undefined : ariaLabel || 'Select option'}
          value={isControlled ? value : internalValue}
          onChange={handleChange}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {normalizedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Visual row — pointer-events: none so clicks fall through to the select */}
        <div className="select-field__display" aria-hidden="true">
          {iconVariant ? (
            <span className="select-field__left-icon">
              <Icon variant={iconVariant} />
            </span>
          ) : null}

          <span className={`select-field__value${selectedLabel ? '' : ' select-field__value--placeholder'}`}>
            {selectedLabel || placeholder}
          </span>

          <span className="select-field__right-icon">
            <Icon variant={ICON_VARIANTS.CHEVRON_DOWN} />
          </span>
        </div>
      </div>
    </div>
  );
}
