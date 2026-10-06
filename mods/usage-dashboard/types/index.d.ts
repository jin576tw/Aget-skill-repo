export type UsageRateLimit = { kind: string; percentUsed: number; resetsAt?: string }

export type UsageSnapshot = {
  context: { tokens?: number; window: number; percent?: number }
  rateLimits: UsageRateLimit[]
  cost?: { usd: number }
}

declare module 'claude-code' {
  interface PluginState {
    'usage-dashboard': {
      snapshot: UsageSnapshot | null
      now: number
      tzOffsetMinutes: number | null
      isHidden: boolean
    }
  }
}
