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

export interface IFormItemProps {
  as?: React.ElementType
  className?: string
  style?: React.CSSProperties
  prefixCls?: string
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
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  asterisk?: boolean
  optionalMarkHidden?: boolean
  gridSpan?: number
  bordered?: boolean
  requiredMark?: boolean | 'optional'
  children?:
    | React.ReactNode
    | ((context: IFormItemContextValue) => React.ReactNode)
}

interface IFormItemResolvedProps extends IFormItemProps {
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
  props: IFormItemResolvedProps
  active: boolean
  setActive: React.Dispatch<React.SetStateAction<boolean>>
  overflow: boolean
  rootDataAttrs: Record<string, any>
  labelStyle: React.CSSProperties
  controlStyle: React.CSSProperties
  renderLabel: (props?: {
    as?: React.ElementType
    className?: string
    style?: React.CSSProperties
  }) => React.ReactNode
}

const FormItemContext = React.createContext<IFormItemContextValue>(null)

const useOverflow = <
  Container extends HTMLElement,
  Content extends HTMLElement
>() => {
  const [overflow, setOverflow] = useState(false)
  const containerRef = useRef<Container>()
  const contentRef = useRef<Content>()

  useEffect(() => {
    requestAnimationFrame(() => {
      if (!containerRef.current || !contentRef.current) return
      const containerWidth = containerRef.current.getBoundingClientRect().width
      const contentWidth = contentRef.current.getBoundingClientRect().width
      setOverflow(
        !!containerWidth && !!contentWidth && contentWidth > containerWidth
      )
    })
  })

  return {
    overflow,
    containerRef,
    contentRef,
  }
}

const getResolvedProps = (props: IFormItemProps): IFormItemResolvedProps => ({
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
  const { overflow, containerRef, contentRef } = useOverflow<
    HTMLDivElement,
    HTMLSpanElement
  >()

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

  const renderLabel = (slotProps?: {
    as?: React.ElementType
    className?: string
    style?: React.CSSProperties
  }) => {
    if (!resolvedProps.label) return null
    const LabelTag = slotProps?.as || 'div'
    const showOptional =
      !resolvedProps.asterisk &&
      resolvedProps.requiredMark === 'optional' &&
      !resolvedProps.optionalMarkHidden

    return (
      <LabelTag
        className={slotProps?.className}
        style={{ ...labelStyle, ...slotProps?.style }}
        data-slot="label"
        data-tooltip={
          (resolvedProps.tooltipLayout === 'text' && !!resolvedProps.tooltip) ||
          overflow
            ? ''
            : undefined
        }
        data-col={resolvedProps.labelCol}
      >
        <div
          data-slot="label-content"
          ref={containerRef}
          title={
            overflow && typeof resolvedProps.label === 'string'
              ? resolvedProps.label
              : undefined
          }
        >
          <span ref={contentRef}>
            {resolvedProps.asterisk && resolvedProps.requiredMark === true && (
              <span data-slot="asterisk">*</span>
            )}
            <label htmlFor={resolvedProps.labelFor}>
              {resolvedProps.label}
            </label>
            {showOptional && <span data-slot="optional">optional</span>}
          </span>
        </div>
        {resolvedProps.tooltip &&
          resolvedProps.tooltipLayout === 'icon' &&
          !overflow && (
            <span data-slot="tooltip-icon">
              {resolvedProps.tooltipIcon ?? '?'}
            </span>
          )}
        {resolvedProps.label !== ' ' && (
          <span data-slot="colon">{resolvedProps.colon ? ':' : ''}</span>
        )}
      </LabelTag>
    )
  }

  return {
    props: resolvedProps,
    active,
    setActive,
    overflow,
    rootDataAttrs,
    labelStyle,
    controlStyle,
    renderLabel,
  }
}

export const useFormItemContext = () => useContext(FormItemContext)

type SlotProps = React.PropsWithChildren<{
  as?: React.ElementType
  className?: string
  style?: React.CSSProperties
}>

export const FormItemLabel: React.FC<SlotProps> = ({
  as,
  className,
  style,
}) => {
  const ctx = useFormItemContext()
  if (!ctx) return null
  return <>{ctx.renderLabel({ as, className, style })}</>
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
      data-slot="control"
      data-col={ctx.props.wrapperCol}
    >
      {children}
    </Tag>
  )
}

const FormItemRoot: React.FC<React.PropsWithChildren<IFormItemProps>> = ({
  children,
  ...props
}) => {
  const ctx = useFormItemState(props)
  const RootTag = props.as || 'div'

  const content =
    typeof children === 'function'
      ? (children as (context: IFormItemContextValue) => React.ReactNode)(ctx)
      : children

  return (
    <FormItemContext.Provider value={ctx}>
      <RootTag
        {...pickDataProps(props)}
        style={props.style}
        className={props.className}
        {...ctx.rootDataAttrs}
        onFocus={() => {
          if (ctx.props.feedbackIcon || ctx.props.inset) {
            ctx.setActive(true)
          }
        }}
        onBlur={() => {
          if (ctx.props.feedbackIcon || ctx.props.inset) {
            ctx.setActive(false)
          }
        }}
      >
        {ctx.renderLabel()}
        <div data-slot="control-wrap" data-col={ctx.props.wrapperCol}>
          <div data-slot="control-inner">
            {ctx.props.addonBefore && (
              <div data-slot="addon-before">{ctx.props.addonBefore}</div>
            )}
            <div
              data-slot="control-content"
              style={ctx.controlStyle}
              data-has-feedback-icon={ctx.props.feedbackIcon ? '' : undefined}
            >
              {content}
              {ctx.props.feedbackIcon && (
                <div data-slot="feedback-icon">{ctx.props.feedbackIcon}</div>
              )}
            </div>
            {ctx.props.addonAfter && (
              <div data-slot="addon-after">{ctx.props.addonAfter}</div>
            )}
          </div>
          {!!ctx.props.feedbackText && ctx.props.feedbackLayout !== 'none' && (
            <div
              data-slot="help"
              data-feedback-status={ctx.props.feedbackStatus}
              data-feedback-layout={ctx.props.feedbackLayout}
            >
              {ctx.props.feedbackText}
            </div>
          )}
          {ctx.props.extra && <div data-slot="extra">{ctx.props.extra}</div>}
        </div>
      </RootTag>
    </FormItemContext.Provider>
  )
}

export type ComposeFormItem = React.FC<
  React.PropsWithChildren<IFormItemProps>
> & {
  Label?: typeof FormItemLabel
  Control?: typeof FormItemControl
  useContext?: typeof useFormItemContext
}

export const FormItem: ComposeFormItem = Object.assign(FormItemRoot, {
  Label: FormItemLabel,
  Control: FormItemControl,
  useContext: useFormItemContext,
})

/** @deprecated use IFormItemContextValue */
export type IFormItemHeadlessContext = IFormItemContextValue
/** @deprecated use useFormItemState */
export const useFormItemHeadless = useFormItemState

export default FormItem
