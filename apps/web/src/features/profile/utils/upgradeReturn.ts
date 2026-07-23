export type UpgradeReturn = 'success' | 'cancelled'

const PATH_BY_STATUS: Record<UpgradeReturn, string> = {
  success: '/account/upgrade-success',
  cancelled: '/account/upgrade-cancelled',
}

export function readUpgradeReturn(): UpgradeReturn | null {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  for (const status of Object.keys(PATH_BY_STATUS) as UpgradeReturn[]) {
    if (path.endsWith(PATH_BY_STATUS[status])) {
      return status
    }
  }
  return null
}

export function clearUpgradeReturnFromUrl(): void {
  const url = new URL(window.location.href)
  for (const status of Object.keys(PATH_BY_STATUS) as UpgradeReturn[]) {
    if (url.pathname.replace(/\/$/, '').endsWith(PATH_BY_STATUS[status])) {
      url.pathname = '/'
      break
    }
  }
  window.history.replaceState(null, '', url.toString())
}
