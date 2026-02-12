import React, { useContext, useMemo, useRef, useState, useEffect } from 'react'

const pickDataProps = (props: any = {}) => {
  const results = {}
  for (const key in props) {
    if (key.indexOf('data-') > -1) {
      results[key] = props[key]
    }
  }
  return results
}

type ElementType = React.ElementType

type PolymorphicProps = {
  as?: ElementType
  className?: string
  style?: React.CSSProperties
}

export interface IFormItemProps extends PolymorphicProps {
  label?: React.ReactNode
  colon?: boolean
  tooltip?: React.ReactNode
  tooltipIcon?: React.ReactNode
  layout?: 'vertical' | 'horizontal' | 'inline'
  tooltipLayout?: 'icon' | 'text'
  labelStyle?: React.CSSProperties
  labelAlign?: 'left' | 'right'
  labelFor?: string
  labelWrap?: boolean
  labelWidth?: number | string
  wrapperWidth?: number | string
  labelCol?: number
  wrapperCol?: number
  wrapperAlign?: 'left' | 'right'
  wrapperWrap?: boolean
  wrapperStyle?: React.CSSProperties
  fullness?: boolean
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
  size?: 'small' | 'default' | 'large'
  inset?: boolean
  extra?: React.ReactNode
  feedbackText?: React.ReactNode
  feedbackLayout?: 'loose' | 'terse' | 'popover' | 'none' | (string & {})
  feedbackStatus?: 'error' | 'warning' | 'success' | 'pending' | (string & {})
  feedbackIcon?: React.ReactNode
  enableOutlineFeedback?: boolean
  asterisk?: boolean
  optionalMarkHidden?: boolean
  gridSpan?: number
  bordered?: boolean
  requiredMark?: boolean | 'optional'
  children?:
    | React.ReactNode
    | ((context: IFormItemContextValue) => React.ReactNode)
}

interface IResolvedFormItemProps extends IFormItemProps {
  layout: 'vertical' | 'horizontal' | 'inline'
  wrapperAlign: 'left' | 'right'
  feedbackLayout: 'loose' | 'terse' | 'popover' | 'none' | (string & {})
  enableOutlineFeedback: boolean
  tooltipLayout: 'icon' | 'text'
  colon: boolean
  requiredMark: boolean | 'optional'
  optionalMarkHidden: boolean
  bordered: boolean
}

export interface IFormItemContextValue {
  props: IResolvedFormItemProps
  active: boolean
  setActive: React.Dispatch<React.SetStateAction<boolean>>
  overflow: boolean
  refs: {
    labelContainerRef: React.MutableRefObject<HTMLDivElement>
    labelContentRef: React.MutableRefObject<HTMLSpanElement>
  }
  rootDataAttrs: Record<string, any>
  labelDataAttrs: Record<string, any>
  controlDataAttrs: Record<string, any>
  labelStyle: React.CSSProperties
  controlStyle: React.CSSProperties
}

const FormItemContext = React.createContext<IFormItemContextValue>(null)

const getResolvedProps = (props: IFormItemProps): IResolvedFormItemProps => ({
  ...props,
  layout: props.layout ?? 'horizontal',
  wrapperAlign: props.wrapperAlign ?? 'left',
  feedbackLayout: props.feedbackLayout ?? 'loose',
  enableOutlineFeedback: props.enableOutlineFeedback ?? true,
  tooltipLayout: props.tooltipLayout ?? 'icon',
  colon: props.colon ?? true,
  requiredMark: props.requiredMark ?? true,
  optionalMarkHidden: props.optionalMarkHidden ?? false,
  bordered: props.bordered ?? true,
})

export const useFormItemState = (
  props: IFormItemProps
): IFormItemContextValue => {
  const resolvedProps = getResolvedProps(props)
  const [active, setActive] = useState(false)
  const [overflow, setOverflow] = useState(false)
  const labelContainerRef = useRef<HTMLDivElement>()
  const labelContentRef = useRef<HTMLSpanElement>()

  useEffect(() => {
    requestAnimationFrame(() => {
      if (!labelContainerRef.current || !labelContentRef.current) return
      const containerWidth =
        labelContainerRef.current.getBoundingClientRect().width
      const contentWidth = labelContentRef.current.getBoundingClientRect().width
      setOverflow(
        !!containerWidth && !!contentWidth && contentWidth > containerWidth
      )
    })
  })

  const labelStyle = useMemo(() => {
    const nextStyle = { ...resolvedProps.labelStyle }
    if (resolvedProps.labelWidth) {
      nextStyle.width =
        resolvedProps.labelWidth === 'auto'
          ? undefined
          : resolvedProps.labelWidth
      nextStyle.maxWidth =
        resolvedProps.labelWidth === 'auto'
          ? undefined
          : resolvedProps.labelWidth
    }
    return nextStyle
  }, [resolvedProps.labelStyle, resolvedProps.labelWidth])

  const controlStyle = useMemo(() => {
    const nextStyle = { ...resolvedProps.wrapperStyle }
    if (resolvedProps.wrapperWidth) {
      nextStyle.width =
        resolvedProps.wrapperWidth === 'auto'
          ? undefined
          : resolvedProps.wrapperWidth
      nextStyle.maxWidth =
        resolvedProps.wrapperWidth === 'auto'
          ? undefined
          : resolvedProps.wrapperWidth
    }
    return nextStyle
  }, [resolvedProps.wrapperStyle, resolvedProps.wrapperWidth])

  const rootDataAttrs = {
    'data-slot': 'root',
    'data-layout': resolvedProps.layout,
    'data-size': resolvedProps.size,
    'data-feedback-status': resolvedProps.feedbackStatus,
    'data-feedback-layout': resolvedProps.feedbackLayout,
    'data-label-align': resolvedProps.labelAlign,
    'data-control-align': resolvedProps.wrapperAlign,
    'data-label-wrap': resolvedProps.labelWrap ? '' : undefined,
    'data-control-wrap': resolvedProps.wrapperWrap ? '' : undefined,
    'data-fullness':
      resolvedProps.fullness ||
      resolvedProps.inset ||
      resolvedProps.feedbackIcon
        ? ''
        : undefined,
    'data-inset': resolvedProps.inset ? '' : undefined,
    'data-inset-active': resolvedProps.inset && active ? '' : undefined,
    'data-active': active ? '' : undefined,
    'data-borderless':
      resolvedProps.bordered === false ||
      resolvedProps.inset ||
      resolvedProps.feedbackIcon
        ? ''
        : undefined,
    'data-grid-span': resolvedProps.gridSpan,
  }

  const labelDataAttrs = {
    'data-slot': 'label',
    'data-col': resolvedProps.labelCol,
    'data-label-overflow': overflow ? '' : undefined,
    'data-tooltip-mode': resolvedProps.tooltip
      ? resolvedProps.tooltipLayout
      : undefined,
  }

  const controlDataAttrs = {
    'data-slot': 'control',
    'data-col': resolvedProps.wrapperCol,
    'data-has-feedback-icon': resolvedProps.feedbackIcon ? '' : undefined,
  }

  return {
    props: resolvedProps,
    active,
    setActive,
    overflow,
    refs: {
      labelContainerRef,
      labelContentRef,
    },
    rootDataAttrs,
    labelDataAttrs,
    controlDataAttrs,
    labelStyle,
    controlStyle,
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
        className={className}
        style={style}
        {...value.rootDataAttrs}
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
  const content = typeof children === 'function' ? children(value) : children

  return (
    <FormItemContext.Provider value={value}>
      <Tag
        {...pickDataProps(props)}
        style={props.style}
        className={props.className}
        {...value.rootDataAttrs}
        onFocus={() => {
          if (value.props.feedbackIcon || value.props.inset)
            value.setActive(true)
        }}
        onBlur={() => {
          if (value.props.feedbackIcon || value.props.inset)
            value.setActive(false)
        }}
      >
        {content}
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

  const showOptional =
    !ctx.props.asterisk &&
    ctx.props.requiredMark === 'optional' &&
    !ctx.props.optionalMarkHidden

  return (
    <Tag
      className={className}
      style={{ ...ctx.labelStyle, ...style }}
      {...ctx.labelDataAttrs}
      htmlFor={ctx.props.labelFor as any}
    >
      <span data-slot="label-content" ref={ctx.refs.labelContainerRef as any}>
        <span ref={ctx.refs.labelContentRef as any}>
          {ctx.props.asterisk && ctx.props.requiredMark === true && (
            <span data-slot="asterisk">*</span>
          )}
          {children ?? ctx.props.label}
          {showOptional && <span data-slot="optional">optional</span>}
        </span>
      </span>
      {ctx.props.label !== ' ' && (
        <span data-slot="colon">{ctx.props.colon ? ':' : ''}</span>
      )}
      {ctx.props.tooltip &&
        ctx.props.tooltipLayout === 'icon' &&
        !ctx.overflow && (
          <span data-slot="tooltip-icon">{ctx.props.tooltipIcon ?? '?'}</span>
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
      className={className}
      style={{ ...ctx.controlStyle, ...style }}
      {...ctx.controlDataAttrs}
    >
      {children}
    </Tag>
  )
}

export const FormItemHelperText: React.FC<SlotProps> = ({
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

  const content = children ?? ctx.props.extra
  if (!content) return null
  return (
    <Tag data-slot="helper-text" className={className} style={style}>
      {content}
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

  const content = children ?? ctx.props.feedbackText
  const isInvalid = ctx.props.feedbackStatus === 'error'
  if (!content || !isInvalid) return null

  return (
    <Tag
      data-slot="error-text"
      data-feedback-status={ctx.props.feedbackStatus}
      data-feedback-layout={ctx.props.feedbackLayout}
      className={className}
      style={style}
    >
      {content}
    </Tag>
  )
}

export type ComposeFormItem = React.FC<
  React.PropsWithChildren<IFormItemProps>
> & {
  Root?: typeof FormItemRoot
  RootProvider?: typeof FormItemRootProvider
  Label?: typeof FormItemLabel
  Control?: typeof FormItemControl
  HelperText?: typeof FormItemHelperText
  ErrorText?: typeof FormItemErrorText
  useContext?: typeof useFormItemContext
}

export const FormItem: ComposeFormItem = Object.assign(FormItemRoot, {
  Root: FormItemRoot,
  RootProvider: FormItemRootProvider,
  Label: FormItemLabel,
  Control: FormItemControl,
  HelperText: FormItemHelperText,
  ErrorText: FormItemErrorText,
  useContext: useFormItemContext,
})

/** @deprecated use IFormItemContextValue */
export type IFormItemHeadlessContext = IFormItemContextValue
/** @deprecated use useFormItemState */
export const useFormItemHeadless = useFormItemState

export default FormItem
