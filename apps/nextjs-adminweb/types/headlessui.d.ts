declare module '@headlessui/react' {
  import { ReactNode } from 'react'

  export interface DialogProps {
    as?: React.ElementType
    open?: boolean
    onClose?: () => void
    children?: ReactNode
    className?: string
  }

  export interface TransitionProps {
    show?: boolean
    as?: React.ElementType
    children?: ReactNode
    enter?: string
    enterFrom?: string
    enterTo?: string
    leave?: string
    leaveFrom?: string
    leaveTo?: string
  }

  export interface TransitionChildProps extends TransitionProps {}

  export const Dialog: React.FC<DialogProps> & {
    Panel: React.FC<DialogProps>
    Title: React.FC<DialogProps>
  }

  export const Transition: React.FC<TransitionProps> & {
    Child: React.FC<TransitionChildProps>
  }
} 