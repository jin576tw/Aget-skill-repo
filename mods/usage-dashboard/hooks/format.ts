import type { UsageRateLimit, UsageSnapshot } from '../types'

export type Line = { key: string; label: string; body: string; color?: string; isDim?: boolean }

const WAITING = '等待首筆用量'
const NO_PLAN_LIMITS = '此登入方式未提供方案額度'
const KIND_ORDER = ['five_hour', 'seven_day']
const KIND_LABELS: Record<string, [wide: string, narrow: string]> = {
  five_hour: ['5 小時額度', '5h'],
  seven_day: ['7 天額度', '7d'],
}

/** 以寬度決定版面：窄於此值改用精簡格式。 */
export const NARROW_COLUMNS = 72

const clamp = (n: number, low: number, high: number) => Math.min(high, Math.max(low, n))
const oneDecimal = (n: number) => String(Math.round(n * 10) / 10)
const withCommas = (n: number) => Math.round(n).toLocaleString('en-US')

export const compactTokens = (n: number) =>
  n >= 1_000_000 ? `${oneDecimal(n / 1_000_000)}M` : n >= 1000 ? `${oneDecimal(n / 1000)}k` : String(Math.round(n))

export const bar = (percent: number, width: number) => {
  const filled = Math.round((clamp(percent, 0, 100) / 100) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

const levelColor = (usedPercent: number) =>
  usedPercent >= 90 ? 'red' : usedPercent >= 70 ? 'yellow' : 'green'

export const kindLabel = (kind: string, isNarrow: boolean) => {
  const labels = KIND_LABELS[kind]
  return labels ? labels[isNarrow ? 1 : 0] : kind
}

export const sortRateLimits = (limits: UsageRateLimit[]) =>
  [...limits].sort((a, b) => {
    const rank = (kind: string) => {
      const at = KIND_ORDER.indexOf(kind)
      return at === -1 ? KIND_ORDER.length : at
    }
    return rank(a.kind) - rank(b.kind)
  })

export const countdown = (ms: number) => {
  const minutes = Math.ceil(ms / 60_000)
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const rest = minutes % 60
  if (days > 0) return `${days}d${hours}h`
  if (hours > 0) return `${hours}h${String(rest).padStart(2, '0')}m`
  return `${rest}m`
}

/** 以 offset（分鐘，東正西負）把時間點換成本地時鐘；超過 24 小時才帶日期。 */
export const localClock = (epochMs: number, nowMs: number, offsetMinutes: number) => {
  const shifted = new Date(epochMs + offsetMinutes * 60_000)
  const hhmm = `${String(shifted.getUTCHours()).padStart(2, '0')}:${String(shifted.getUTCMinutes()).padStart(2, '0')}`
  return epochMs - nowMs > 86_400_000 ? `${shifted.getUTCMonth() + 1}/${shifted.getUTCDate()} ${hhmm}` : hhmm
}

export const resetText = (resetsAt: string | undefined, nowMs: number, offsetMinutes: number, isNarrow: boolean) => {
  if (resetsAt === undefined) return isNarrow ? '重置?' : '重置時間未提供'
  const at = Date.parse(resetsAt)
  if (Number.isNaN(at)) return isNarrow ? '重置?' : '重置時間無法解析'
  if (at <= nowMs) return isNarrow ? '已重置' : '已過重置時間，等待下次讀數'
  const left = countdown(at - nowMs)
  return isNarrow ? `↺${left}` : `${localClock(at, nowMs, offsetMinutes)} 重置（${left} 後）`
}

export const contextLine = (snapshot: UsageSnapshot | null, isNarrow: boolean): Line => {
  const label = isNarrow ? 'ctx' : 'Context'
  const context = snapshot?.context
  if (!context || context.tokens === undefined || !(context.window > 0)) {
    return { key: 'context', label, body: WAITING, isDim: true }
  }
  const { tokens, window } = context
  const percent = context.percent ?? (tokens / window) * 100
  const left = Math.max(0, window - tokens)
  const shown = `${Math.round(clamp(percent, 0, 999))}%`
  const body = isNarrow
    ? `${bar(percent, 8)} ${shown} 剩 ${compactTokens(left)}`
    : `${bar(percent, 16)} ${shown}  已用 ${withCommas(tokens)} / ${withCommas(window)} · 剩餘 ${withCommas(left)} tokens`
  return { key: 'context', label, body, color: levelColor(percent) }
}

export const rateLimitLines = (
  snapshot: UsageSnapshot | null,
  nowMs: number,
  offsetMinutes: number,
  isNarrow: boolean,
): Line[] => {
  const limits = snapshot?.rateLimits ?? []
  if (limits.length === 0) {
    const hasReading = snapshot?.context.tokens !== undefined
    return [{ key: 'plan', label: isNarrow ? '方案' : '方案額度', body: hasReading ? NO_PLAN_LIMITS : WAITING, isDim: true }]
  }
  return sortRateLimits(limits).map(limit => {
    const used = Number.isFinite(limit.percentUsed) ? Math.max(0, limit.percentUsed) : 0
    const left = Math.max(0, 100 - used)
    const over = used > 100 ? (isNarrow ? ' 超額' : '（已超過上限）') : ''
    const reset = resetText(limit.resetsAt, nowMs, offsetMinutes, isNarrow)
    const body = isNarrow
      ? `剩${oneDecimal(left)}%${over} ${reset}`
      : `${bar(used, 10)} 已用 ${oneDecimal(used)}% · 剩餘 ${oneDecimal(left)}%${over} · ${reset}`
    return { key: `limit-${limit.kind}`, label: kindLabel(limit.kind, isNarrow), body, color: levelColor(used) }
  })
}

export const costLine = (snapshot: UsageSnapshot | null, isNarrow: boolean): Line | null => {
  const usd = snapshot?.cost?.usd
  if (usd === undefined || !Number.isFinite(usd)) return null
  return {
    key: 'cost',
    label: isNarrow ? '$' : 'Session 費用',
    body: isNarrow ? `${usd.toFixed(2)}` : `$${usd.toFixed(2)}（API 牌價估算，非訂閱方案 token 餘額）`,
    isDim: true,
  }
}

export const dashboardLines = (
  snapshot: UsageSnapshot | null,
  nowMs: number,
  offsetMinutes: number,
  columns: number,
): Line[] => {
  const isNarrow = columns < NARROW_COLUMNS
  const cost = costLine(snapshot, isNarrow)
  return [
    contextLine(snapshot, isNarrow),
    ...rateLimitLines(snapshot, nowMs, offsetMinutes, isNarrow),
    ...(cost ? [cost] : []),
  ]
}

/** `date +%z` 的 "+0800" → 480；無法解析時 null。 */
export const parseOffset = (text: string) => {
  const match = /^([+-])(\d{2})(\d{2})$/.exec(text.trim())
  if (!match) return null
  const minutes = Number(match[2]) * 60 + Number(match[3])
  return match[1] === '-' ? -minutes : minutes
}
