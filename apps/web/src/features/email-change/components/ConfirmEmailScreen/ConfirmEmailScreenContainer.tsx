import { useConfirmEmailChange } from './hooks/useConfirmEmailChange'
import { ConfirmEmailContext } from './ConfirmEmailScreen.context'
import { ConfirmEmailScreen } from './ConfirmEmailScreen'
import type { ConfirmEmailScreenContainerProps } from './ConfirmEmailScreen.types'

export function ConfirmEmailScreenContainer({ token, onDone }: ConfirmEmailScreenContainerProps) {
  const state = useConfirmEmailChange(token)

  return (
    <ConfirmEmailContext.Provider value={{ ...state, onDone }}>
      <ConfirmEmailScreen />
    </ConfirmEmailContext.Provider>
  )
}
