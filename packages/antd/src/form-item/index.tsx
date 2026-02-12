import React, { useContext, useEffect, useRef, useState } from 'react'
import cls from 'classnames'
import { ConfigProvider, Popover, Tooltip } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'

const usePrefixCls = (
  tag?: string,
  props?: {
    prefixCls?: string
  }
) => {
  if ('ConfigContext' in ConfigProvider) {
    const { getPrefixCls } = useContext(ConfigProvider.ConfigContext)
    return getPrefixCls(tag, props?.prefixCls)
  }
  const prefix = props?.prefixCls ?? 'ant-'
  return `${prefix}${tag ?? ''}`
}

const pickDataProps = (props: any = {}) => {
  const results = {}
  for (const key in props) {
    if (key.indexOf('data-') > -1) {
      results[key] = props[key]
    }
  }
  return results
}

const ICON_MAP = {
  error: <CloseCircleOutlined />,
  success: <CheckCircleOutlined />,
  warning: <ExclamationCircleOutlined />,
}

export interface IFormItemProps {
  className?: string
  style?: React.CSSProperties
  prefixCls?: string
  label?: React.ReactNode
  colon?: boolean
  tooltip?: React.ReactNode | React.ComponentProps<typeof Tooltip>
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
}

export interface IFormItemHeadlessContext {
  prefixCls: string
  props: Required<
    Pick<
      IFormItemProps,
      | 'layout'
      | 'wrapperAlign'
      | 'feedbackLayout'
      | 'enableOutlineFeedback'
      | 'tooltipLayout'
      | 'colon'
      | 'requiredMark'
      | 'optionalMarkHidden'
      | 'bordered'
    >
  > &
    IFormItemProps
  active: boolean
  setActive: React.Dispatch<React.SetStateAction<boolean>>
  overflow: boolean
  labelStyle: React.CSSProperties
  wrapperStyle: React.CSSProperties
  enableCol: boolean
  tooltipNode?: React.ReactNode
  renderLabel: () => React.ReactNode
}

const FormItemContext = React.createContext<IFormItemHeadlessContext>(null)

const isTooltipProps = (
  tooltip: React.ReactNode | React.ComponentProps<typeof Tooltip>
): tooltip is React.ComponentProps<typeof Tooltip> =>
  !React.isValidElement(tooltip)

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
      const contentWidth = contentRef.current.getBoundingClientRect().width
      const containerWidth = containerRef.current.getBoundingClientRect().width
      setOverflow(
        !!contentWidth && !!containerWidth && containerWidth < contentWidth
      )
    })
  })

  return {
    overflow,
    containerRef,
    contentRef,
  }
}

export const useFormItemHeadless = (
  props: IFormItemProps
): IFormItemHeadlessContext => {
  const { locale } = useContext(ConfigProvider.ConfigContext)
  const prefixCls = usePrefixCls('formily-item', props)
  const [active, setActive] = useState(false)
  const { overflow, containerRef, contentRef } = useOverflow<
    HTMLDivElement,
    HTMLSpanElement
  >()

  const normalizedProps = {
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
    tooltipIcon: props.tooltipIcon ?? <QuestionCircleOutlined />,
  }

  const labelStyle = { ...props.labelStyle }
  const wrapperStyle = { ...props.wrapperStyle }
  let enableCol = false

  if (props.labelWidth || props.wrapperWidth) {
    if (props.labelWidth) {
      labelStyle.width =
        props.labelWidth === 'auto' ? undefined : props.labelWidth
      labelStyle.maxWidth =
        props.labelWidth === 'auto' ? undefined : props.labelWidth
    }
    if (props.wrapperWidth) {
      wrapperStyle.width =
        props.wrapperWidth === 'auto' ? undefined : props.wrapperWidth
      wrapperStyle.maxWidth =
        props.wrapperWidth === 'auto' ? undefined : props.wrapperWidth
    }
  }

  if (
    (props.labelCol || props.wrapperCol) &&
    !labelStyle.width &&
    !wrapperStyle.width &&
    normalizedProps.layout !== 'vertical'
  ) {
    enableCol = true
  }

  const tooltipNode = props.tooltip ? (
    isTooltipProps(props.tooltip) ? (
      <Tooltip {...props.tooltip}></Tooltip>
    ) : (
      props.tooltip
    )
  ) : undefined

  const getOverflowTooltip = () => {
    if (overflow) {
      return (
        <div>
          <div>{props.label}</div>
          <div>{tooltipNode}</div>
        </div>
      )
    }
    return tooltipNode
  }

  const renderLabelText = () => {
    const labelChildren = (
      <div className={`${prefixCls}-label-content`} ref={containerRef}>
        <span ref={contentRef}>
          {props.asterisk && normalizedProps.requiredMark === true && (
            <span className={`${prefixCls}-asterisk`}>*</span>
          )}
          <label htmlFor={props.labelFor}>{props.label}</label>
          {!props.asterisk &&
            normalizedProps.requiredMark === 'optional' &&
            !normalizedProps.optionalMarkHidden && (
              <span className={`${prefixCls}-optional`}>
                {locale?.Form?.optional}
              </span>
            )}
        </span>
      </div>
    )

    if (
      (normalizedProps.tooltipLayout === 'text' && props.tooltip) ||
      overflow
    ) {
      return (
        <Tooltip
          placement="top"
          align={{ offset: [0, 10] }}
          title={getOverflowTooltip()}
        >
          {labelChildren}
        </Tooltip>
      )
    }

    return labelChildren
  }

  const renderTooltipIcon = () => {
    if (
      props.tooltip &&
      normalizedProps.tooltipLayout === 'icon' &&
      !overflow
    ) {
      return (
        <span className={`${prefixCls}-label-tooltip-icon`}>
          <Tooltip
            placement="top"
            align={{ offset: [0, 2] }}
            title={tooltipNode}
          >
            {normalizedProps.tooltipIcon}
          </Tooltip>
        </span>
      )
    }
    return null
  }

  const renderLabel = () => {
    if (!props.label) return null
    return (
      <div
        className={cls({
          [`${prefixCls}-label`]: true,
          [`${prefixCls}-label-tooltip`]:
            (props.tooltip && normalizedProps.tooltipLayout === 'text') ||
            overflow,
          [`${prefixCls}-item-col-${props.labelCol}`]:
            enableCol && !!props.labelCol,
        })}
        style={labelStyle}
      >
        {renderLabelText()}
        {renderTooltipIcon()}
        {props.label !== ' ' && (
          <span className={`${prefixCls}-colon`}>
            {normalizedProps.colon ? ':' : ''}
          </span>
        )}
      </div>
    )
  }

  return {
    prefixCls,
    props: normalizedProps,
    active,
    setActive,
    overflow,
    labelStyle,
    wrapperStyle,
    enableCol,
    tooltipNode,
    renderLabel,
  }
}

export const useFormItemContext = () => useContext(FormItemContext)

export const BaseItem: React.FC<React.PropsWithChildren<IFormItemProps>> = ({
  children,
  ...props
}) => {
  const headless = useFormItemHeadless(props)
  const { prefixCls, active, setActive, wrapperStyle, enableCol } = headless
  const {
    style,
    className,
    layout,
    feedbackStatus,
    feedbackText,
    feedbackLayout,
    feedbackIcon,
    enableOutlineFeedback,
    size,
    fullness,
    inset,
    labelAlign,
    wrapperAlign,
    labelWrap,
    wrapperWrap,
    bordered,
    addonBefore,
    addonAfter,
    extra,
    getPopupContainer,
    wrapperCol,
    label,
    gridSpan,
  } = headless.props

  const content =
    typeof children === 'function'
      ? (children as (ctx: IFormItemHeadlessContext) => React.ReactNode)(
          headless
        )
      : children

  const renderedChildren =
    feedbackLayout === 'popover' ? (
      <Popover
        autoAdjustOverflow
        placement="top"
        content={
          <div
            className={cls({
              [`${prefixCls}-${feedbackStatus}-help`]: !!feedbackStatus,
              [`${prefixCls}-help`]: true,
            })}
          >
            {ICON_MAP[feedbackStatus]} {feedbackText}
          </div>
        }
        visible={!!feedbackText}
        getPopupContainer={getPopupContainer}
      >
        {content}
      </Popover>
    ) : (
      content
    )

  return (
    <FormItemContext.Provider value={headless}>
      <div
        {...pickDataProps(props)}
        style={style}
        data-grid-span={gridSpan}
        className={cls({
          [`${prefixCls}`]: true,
          [`${prefixCls}-layout-${layout}`]: true,
          [`${prefixCls}-${feedbackStatus}`]:
            enableOutlineFeedback && !!feedbackStatus,
          [`${prefixCls}-feedback-has-text`]: !!feedbackText,
          [`${prefixCls}-size-${size}`]: !!size,
          [`${prefixCls}-feedback-layout-${feedbackLayout}`]: !!feedbackLayout,
          [`${prefixCls}-fullness`]: !!fullness || !!inset || !!feedbackIcon,
          [`${prefixCls}-inset`]: !!inset,
          [`${prefixCls}-active`]: active,
          [`${prefixCls}-inset-active`]: !!inset && active,
          [`${prefixCls}-label-align-${labelAlign}`]: true,
          [`${prefixCls}-control-align-${wrapperAlign}`]: true,
          [`${prefixCls}-label-wrap`]: !!labelWrap,
          [`${prefixCls}-control-wrap`]: !!wrapperWrap,
          [`${prefixCls}-bordered-none`]:
            bordered === false || !!inset || !!feedbackIcon,
          [className]: !!className,
        })}
        onFocus={() => {
          if (feedbackIcon || inset) {
            setActive(true)
          }
        }}
        onBlur={() => {
          if (feedbackIcon || inset) {
            setActive(false)
          }
        }}
      >
        {headless.renderLabel()}
        <div
          className={cls({
            [`${prefixCls}-control`]: true,
            [`${prefixCls}-item-col-${wrapperCol}`]:
              enableCol && !!wrapperCol && label,
          })}
        >
          <div className={cls(`${prefixCls}-control-content`)}>
            {addonBefore && (
              <div className={cls(`${prefixCls}-addon-before`)}>
                {addonBefore}
              </div>
            )}
            <div
              style={wrapperStyle}
              className={cls({
                [`${prefixCls}-control-content-component`]: true,
                [`${prefixCls}-control-content-component-has-feedback-icon`]:
                  !!feedbackIcon,
              })}
            >
              {renderedChildren}
              {feedbackIcon && (
                <div className={cls(`${prefixCls}-feedback-icon`)}>
                  {feedbackIcon}
                </div>
              )}
            </div>
            {addonAfter && (
              <div className={cls(`${prefixCls}-addon-after`)}>
                {addonAfter}
              </div>
            )}
          </div>
          {!!feedbackText &&
            feedbackLayout !== 'popover' &&
            feedbackLayout !== 'none' && (
              <div
                className={cls({
                  [`${prefixCls}-${feedbackStatus}-help`]: !!feedbackStatus,
                  [`${prefixCls}-help`]: true,
                  [`${prefixCls}-help-enter`]: true,
                  [`${prefixCls}-help-enter-active`]: true,
                })}
              >
                {feedbackText}
              </div>
            )}
          {extra && <div className={cls(`${prefixCls}-extra`)}>{extra}</div>}
        </div>
      </div>
    </FormItemContext.Provider>
  )
}

export const FormItemLabel: React.FC<React.PropsWithChildren<{}>> = () => {
  const ctx = useFormItemContext()
  return ctx?.renderLabel() ?? null
}

export const FormItemControl: React.FC<
  React.PropsWithChildren<{ className?: string; style?: React.CSSProperties }>
> = ({ children, className, style }) => {
  const ctx = useFormItemContext()
  if (!ctx) return <>{children}</>
  return (
    <div
      className={cls(`${ctx.prefixCls}-control-content-component`, className)}
      style={style}
    >
      {children}
    </div>
  )
}

export type ComposeFormItem = React.FC<
  React.PropsWithChildren<IFormItemProps>
> & {
  BaseItem?: React.FC<React.PropsWithChildren<IFormItemProps>>
  Label?: typeof FormItemLabel
  Control?: typeof FormItemControl
  useContext?: typeof useFormItemContext
}

export const FormItem: ComposeFormItem = Object.assign(BaseItem, {
  BaseItem,
  Label: FormItemLabel,
  Control: FormItemControl,
  useContext: useFormItemContext,
})

export default FormItem
