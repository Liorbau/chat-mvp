type ErrorToastProps = {
  message: string
}

const TOAST_STYLE = {
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '10px 12px',
  marginBottom: '10px',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '8px',
  alignItems: 'center',
}

function ErrorToast({ message }: ErrorToastProps) {
  return (
    <div role="alert" style={TOAST_STYLE}>
      <span>{message}</span>
    </div>
  )
}

export default ErrorToast
