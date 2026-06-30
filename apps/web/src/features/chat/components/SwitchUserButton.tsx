type SwitchUserButtonProps = {
  onClick: () => void
}

const STYLE = {
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  borderRadius: '8px',
  padding: '6px 10px',
  cursor: 'pointer',
}

function SwitchUserButton({ onClick }: SwitchUserButtonProps) {
  return (
    <button type="button" style={STYLE} onClick={onClick}>
      Switch user
    </button>
  )
}

export default SwitchUserButton
