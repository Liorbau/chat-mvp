export type UpgradeReturnStatus = 'success' | 'cancelled'

const UPGRADE_RETURN_PATH: Record<UpgradeReturnStatus, string> = {
  success: '/account/upgrade-success',
  cancelled: '/account/upgrade-cancelled',
}

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/$/, '')}${path}`
}

export function buildCheckoutReturnUrls(webAppUrl: string): {
  completeUrl: string
  cancelUrl: string
} {
  return {
    completeUrl: joinUrl(webAppUrl, UPGRADE_RETURN_PATH.success),
    cancelUrl: joinUrl(webAppUrl, UPGRADE_RETURN_PATH.cancelled),
  }
}

export function buildWebAppUpgradeReturnUrl(
  webAppOrigin: string,
  status: UpgradeReturnStatus,
): string {
  return joinUrl(webAppOrigin, UPGRADE_RETURN_PATH[status])
}
