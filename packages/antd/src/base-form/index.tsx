import React from 'react'
import cls from 'classnames'
import {
  BaseForm as HeadlessBaseForm,
  IFormItemBaseFormProps,
} from '../form-item'

export interface IBaseFormProps extends IFormItemBaseFormProps {
  size?: 'small' | 'default' | 'large'
  fullWidth?: boolean
  classNames?: {
    root?: string
    label?: string
    control?: string
    errorText?: string
    addonBefore?: string
    addonAfter?: string
  }
}

const SIZE_CLASS_MAP = {
  small: {
    label: 'text-xs leading-7 min-h-[1.75rem]',
    control: 'min-h-[1.75rem] text-xs',
    error: 'text-xs leading-5',
  },
  default: {
    label: 'text-sm leading-8 min-h-[2rem]',
    control: 'min-h-[2rem] text-sm',
    error: 'text-xs leading-5',
  },
  large: {
    label: 'text-base leading-10 min-h-[2.5rem]',
    control: 'min-h-[2.5rem] text-base',
    error: 'text-sm leading-6',
  },
}

export const BaseForm: React.FC<IBaseFormProps> = ({
  size = 'default',
  fullWidth = true,
  className,
  classNames,
  labelProps,
  controlProps,
  errorTextProps,
  addonBefore,
  addonAfter,
  ...props
}) => {
  const sizeClasses = SIZE_CLASS_MAP[size]

  return (
    <HeadlessBaseForm
      {...props}
      className={cls(
        'relative mb-4 flex items-start gap-2 text-gray-800',
        fullWidth && 'w-full',
        props.disabled && 'opacity-60 cursor-not-allowed',
        className,
        classNames?.root
      )}
      labelProps={{
        ...labelProps,
        className: cls(
          'inline-flex shrink-0 items-center gap-1 text-right text-gray-700',
          sizeClasses.label,
          labelProps?.className,
          classNames?.label
        ),
      }}
      controlProps={{
        ...controlProps,
        className: cls(
          'flex-1 rounded border border-gray-300 bg-white px-3 transition-colors',
          'focus-within:border-blue-500',
          props.invalid && 'border-red-500',
          props.disabled && 'bg-gray-100',
          sizeClasses.control,
          controlProps?.className,
          classNames?.control
        ),
      }}
      errorTextProps={{
        ...errorTextProps,
        className: cls(
          'mt-1 text-red-500',
          sizeClasses.error,
          errorTextProps?.className,
          classNames?.errorText
        ),
      }}
      addonBefore={
        addonBefore ? (
          <span
            className={cls(
              'mr-2 inline-flex items-center text-gray-500',
              classNames?.addonBefore
            )}
          >
            {addonBefore}
          </span>
        ) : undefined
      }
      addonAfter={
        addonAfter ? (
          <span
            className={cls(
              'ml-2 inline-flex items-center text-gray-500',
              classNames?.addonAfter
            )}
          >
            {addonAfter}
          </span>
        ) : undefined
      }
    />
  )
}

export default BaseForm
