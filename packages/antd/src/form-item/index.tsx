import React, { useContext, useId, useMemo, useState } from 'react'

type ElementType = React.ElementType

type PolymorphicProps = {
  as?: ElementType
  className?: string
  style?: React.CSSProperties
}

const pickDataProps = (props: any = {}) => {
  const results = {}
  for (const key in props) {
    if (key.indexOf('data-') > -1) results[key] = props[key]
  }
  return results
}

export interface IFormItemProps extends PolymorphicProps {
  id?: string
  label?: React.ReactNode
  required?: boolean
  optional?: boolean
  invalid?: boolean
  disabled?: boolean
  errorText?: React.ReactNode
  children?: React.ReactNode
}

export interface IFormItemBaseFormProps extends IFormItemProps {
  labelProps?: PolymorphicProps
  controlProps?: PolymorphicProps
  errorTextProps?: PolymorphicProps
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
}

export interface IFormItemContextValue {
  id: string
  props: IFormItemProps
  active: boolean
  setActive: React.Dispatch<React.SetStateAction<boolean>>
  rootDataAttrs: Record<string, any>
}

const FormItemContext = React.createContext<IFormItemContextValue>(null)

export const useFormItemState = (
  props: IFormItemProps
): IFormItemContextValue => {
  const reactId = useId()
  const id = props.id ?? `form-item-${reactId}`
  const [active, setActive] = useState(false)

  const rootDataAttrs = useMemo(
    () => ({
      'data-slot': 'root',
      'data-active': active ? '' : undefined,
      'data-disabled': props.disabled ? '' : undefined,
      'data-invalid': props.invalid ? '' : undefined,
      'data-required': props.required ? '' : undefined,
      'data-optional': props.optional ? '' : undefined,
    }),
    [active, props.disabled, props.invalid, props.required, props.optional]
  )

  return {
    id,
    props,
    active,
    setActive,
    rootDataAttrs,
  }
}

export const useFormItemContext = () => useContext(FormItemContext)

export interface IFormItemRootProviderProps extends PolymorphicProps {
  value: IFormItemContextValue
  children?: React.ReactNode
}

export const FormItemRootProvider: React.FC<IFormItemRootProviderProps> = ({
  value,
  as,
  className,
  style,
  children,
  ...props
}) => {
  const Tag = as || 'div'
  return (
    <FormItemContext.Provider value={value}>
      <Tag
        {...pickDataProps(props)}
        {...value.rootDataAttrs}
        className={className}
        style={style}
      >
        {children}
      </Tag>
    </FormItemContext.Provider>
  )
}

export const FormItemRoot: React.FC<
  React.PropsWithChildren<IFormItemProps>
> = ({ children, ...props }) => {
  const value = useFormItemState(props)
  const Tag = props.as || 'div'

  return (
    <FormItemContext.Provider value={value}>
      <Tag
        {...pickDataProps(props)}
        {...value.rootDataAttrs}
        className={props.className}
        style={props.style}
        onFocus={() => value.setActive(true)}
        onBlur={() => value.setActive(false)}
      >
        {children}
      </Tag>
    </FormItemContext.Provider>
  )
}

type SlotProps = React.PropsWithChildren<PolymorphicProps>

export const FormItemLabel: React.FC<SlotProps> = ({
  as,
  className,
  style,
  children,
}) => {
  const ctx = useFormItemContext()
  const Tag = as || 'label'
  if (!ctx)
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    )

  return (
    <Tag data-slot="label" className={className} style={style} htmlFor={ctx.id}>
      {children ?? ctx.props.label}
      {ctx.props.required && <span data-slot="required-mark">*</span>}
      {!ctx.props.required && ctx.props.optional && (
        <span data-slot="optional-mark">optional</span>
      )}
    </Tag>
  )
}

export const FormItemControl: React.FC<SlotProps> = ({
  as,
  className,
  style,
  children,
}) => {
  const ctx = useFormItemContext()
  const Tag = as || 'div'
  if (!ctx)
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    )

  return (
    <Tag
      data-slot="control"
      data-invalid={ctx.props.invalid ? '' : undefined}
      data-disabled={ctx.props.disabled ? '' : undefined}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  )
}

export const FormItemErrorText: React.FC<SlotProps> = ({
  as,
  className,
  style,
  children,
}) => {
  const ctx = useFormItemContext()
  const Tag = as || 'div'
  if (!ctx)
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    )

  const content = children ?? ctx.props.errorText
  if (!content || !ctx.props.invalid) return null

  return (
    <Tag data-slot="error-text" className={className} style={style}>
      {content}
    </Tag>
  )
}

export const BaseForm: React.FC<IFormItemBaseFormProps> = ({
  children,
  labelProps,
  controlProps,
  errorTextProps,
  addonBefore,
  addonAfter,
  ...props
}) => {
  return (
    <FormItemRoot {...props}>
      <FormItemLabel {...labelProps} />
      <FormItemControl {...controlProps}>
        {addonBefore && <span data-slot="addon-before">{addonBefore}</span>}
        {children}
        {addonAfter && <span data-slot="addon-after">{addonAfter}</span>}
      </FormItemControl>
      <FormItemErrorText {...errorTextProps} />
    </FormItemRoot>
  )
}

export type ComposeFormItem = React.FC<
  React.PropsWithChildren<IFormItemProps>
> & {
  Root?: typeof FormItemRoot
  RootProvider?: typeof FormItemRootProvider
  Label?: typeof FormItemLabel
  Control?: typeof FormItemControl
  ErrorText?: typeof FormItemErrorText
  BaseForm?: typeof BaseForm
  useContext?: typeof useFormItemContext
}

export const FormItem: ComposeFormItem = Object.assign(FormItemRoot, {
  Root: FormItemRoot,
  RootProvider: FormItemRootProvider,
  Label: FormItemLabel,
  Control: FormItemControl,
  ErrorText: FormItemErrorText,
  BaseForm,
  useContext: useFormItemContext,
})

export default FormItem
