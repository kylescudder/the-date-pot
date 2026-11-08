import {
  type AdditionalField as AdditionalFieldConfig,
  type AdditionalFieldFormValue,
  getFormFieldErrors,
  resolveInputType
} from '@better-auth-ui/core'
import { useAuth, useCopyToClipboard } from '@better-auth-ui/react'
import { Check, Copy } from 'lucide-react'
import { type ComponentType, useRef } from 'react'
import { toast } from 'sonner'

import { Checkbox } from '@/components/auth/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel
} from '@/components/auth/ui/field'
import { Input } from '@/components/auth/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/components/auth/ui/input-group'
import { Textarea } from '@/components/auth/ui/textarea'

export type AdditionalFieldProps = {
  name: string
  field: AdditionalFieldConfig
  value: AdditionalFieldFormValue
  onBlur: () => void
  onChange: (value: AdditionalFieldFormValue) => void
  isInvalid?: boolean
  errors?: unknown[]
  isPending?: boolean
  /** Complete suffix appended to labels for fields that are not required. */
  optionalLabel?: string
}

function valueToString(value: AdditionalFieldFormValue) {
  if (value == null) return ''
  return value instanceof Date ? value.toISOString() : String(value)
}

/**
 * Icon-only copy button used as an `InputGroupAddon`. `getValue` is invoked
 * lazily on click so the button copies the input's *live* value rather than a
 * stale snapshot — important when paired with editable inputs.
 */
function CopyButton({
  getValue,
  isDisabled
}: {
  getValue: () => string | undefined
  isDisabled?: boolean
}) {
  const { localization } = useAuth()
  const { copied, copy } = useCopyToClipboard({
    onError: (error) => {
      console.error('[Better Auth UI] Copy failed', error)
      toast.error(localization.errors.copyFailed)
    }
  })

  async function handleCopy() {
    const value = getValue()
    if (!value) return

    await copy(value)
  }

  return (
    <InputGroupButton
      aria-label={
        copied
          ? localization.settings.copiedToClipboard
          : localization.settings.copyToClipboard
      }
      title={
        copied
          ? localization.settings.copiedToClipboard
          : localization.settings.copyToClipboard
      }
      onClick={handleCopy}
      disabled={isDisabled}
    >
      {copied ? <Check /> : <Copy />}
    </InputGroupButton>
  )
}

/**
 * Renders a single additional user field via shadcn primitives.
 *
 * The Date Pot's profile only uses text fields, so the upstream slider, switch,
 * select, combobox and date branches (and their primitives) are omitted; those
 * types fall back to a plain text input.
 */
export function AdditionalField({
  name,
  field: configuredField,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
  isPending,
  optionalLabel
}: AdditionalFieldProps) {
  const field =
    optionalLabel && !configuredField.required
      ? {
          ...configuredField,
          label: (
            <>
              {configuredField.label}
              {optionalLabel}
            </>
          )
        }
      : configuredField
  const inputType = resolveInputType(field)
  const fieldErrors = getFormFieldErrors(errors ?? [])

  if (field.render) {
    const FieldRenderer = field.render as ComponentType<AdditionalFieldProps>
    return (
      <FieldRenderer
        name={name}
        field={field}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        isInvalid={isInvalid}
        errors={errors}
        isPending={isPending}
        optionalLabel={optionalLabel}
      />
    )
  }

  if (inputType === 'hidden') {
    return (
      <input type='hidden' name={name} value={valueToString(value)} readOnly />
    )
  }

  if (inputType === 'textarea') {
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={name}>{field.label}</FieldLabel>

        <Textarea
          id={name}
          name={name}
          value={valueToString(value)}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value || null)}
          placeholder={field.placeholder}
          required={field.required}
          readOnly={field.readOnly}
          disabled={isPending}
          aria-invalid={isInvalid}
        />

        <FieldError errors={fieldErrors} />
      </Field>
    )
  }

  if (inputType === 'number') {
    const maxFractionDigits = field.formatOptions?.maximumFractionDigits

    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={name}>{field.label}</FieldLabel>

        <Input
          id={name}
          name={name}
          type='number'
          inputMode={maxFractionDigits ? 'decimal' : 'numeric'}
          min={field.min}
          max={field.max}
          step={
            field.step ??
            (maxFractionDigits ? 1 / 10 ** maxFractionDigits : undefined)
          }
          value={typeof value === 'number' ? value : ''}
          onBlur={onBlur}
          onChange={(event) =>
            onChange(
              event.target.value === '' ? null : event.target.valueAsNumber
            )
          }
          placeholder={field.placeholder}
          required={field.required}
          readOnly={field.readOnly}
          disabled={isPending}
          aria-invalid={isInvalid}
        />

        <FieldError errors={fieldErrors} />
      </Field>
    )
  }

  if (inputType === 'checkbox') {
    return (
      <Field data-invalid={isInvalid} orientation='horizontal'>
        <Checkbox
          id={name}
          name={name}
          checked={value === true}
          onBlur={onBlur}
          onCheckedChange={(checked) => onChange(checked === true)}
          required={field.required}
          disabled={isPending || field.readOnly}
          aria-invalid={isInvalid}
        />

        <FieldContent>
          <FieldLabel htmlFor={name}>{field.label}</FieldLabel>
        </FieldContent>
        <FieldError errors={fieldErrors} />
      </Field>
    )
  }

  return (
    <InputField
      name={name}
      field={field}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      isInvalid={isInvalid}
      errors={errors}
      isPending={isPending}
    />
  )
}

function InputField({
  name,
  field,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
  isPending
}: AdditionalFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const fieldErrors = getFormFieldErrors(errors ?? [])

  const hasPrefix = field.prefix != null
  const hasSuffix = field.suffix != null || field.copyable

  const isNumeric = field.type === 'number'
  const maxFractionDigits = field.formatOptions?.maximumFractionDigits
  const nativeInputType = isNumeric ? 'number' : undefined
  const nativeInputMode = isNumeric
    ? maxFractionDigits
      ? 'decimal'
      : 'numeric'
    : undefined
  const nativeStep = maxFractionDigits ? 1 / 10 ** maxFractionDigits : undefined

  if (hasPrefix || hasSuffix) {
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={name}>{field.label}</FieldLabel>

        <InputGroup>
          {hasPrefix && (
            <InputGroupAddon align='inline-start'>
              {field.prefix}
            </InputGroupAddon>
          )}

          <InputGroupInput
            ref={inputRef}
            id={name}
            name={name}
            type={nativeInputType}
            inputMode={nativeInputMode}
            step={nativeStep}
            value={valueToString(value)}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value || null)}
            placeholder={field.placeholder}
            required={field.required}
            readOnly={field.readOnly}
            disabled={isPending}
            aria-invalid={isInvalid}
          />

          {field.copyable ? (
            <InputGroupAddon align='inline-end'>
              <CopyButton
                getValue={() => inputRef.current?.value}
                isDisabled={isPending}
              />
            </InputGroupAddon>
          ) : (
            field.suffix != null && (
              <InputGroupAddon align='inline-end'>
                {field.suffix}
              </InputGroupAddon>
            )
          )}
        </InputGroup>

        <FieldError errors={fieldErrors} />
      </Field>
    )
  }

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={name}>{field.label}</FieldLabel>

      <Input
        id={name}
        name={name}
        type={nativeInputType}
        inputMode={nativeInputMode}
        step={nativeStep}
        value={valueToString(value)}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value || null)}
        placeholder={field.placeholder}
        required={field.required}
        readOnly={field.readOnly}
        disabled={isPending}
        aria-invalid={isInvalid}
      />

      <FieldError errors={fieldErrors} />
    </Field>
  )
}
