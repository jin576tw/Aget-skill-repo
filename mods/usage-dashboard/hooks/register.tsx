import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionMeasureInput, SessionUsage } from 'claude-code'

import type { UsageSnapshot } from '../types'
import { dashboardLines, NARROW_COLUMNS, parseOffset } from './format'

const COMMAND = 'usage-dashboard'
const TICK_MS = 60_000

const snapshot = atom({ plugin: 'usage-dashboard', key: 'snapshot' } as const, null)
const now = atom({ plugin: 'usage-dashboard', key: 'now' } as const, 0)
const tzOffset = atom({ plugin: 'usage-dashboard', key: 'tzOffsetMinutes' } as const, null)
const isHidden = atom({ plugin: 'usage-dashboard', key: 'isHidden' } as const, false)

/** 只留儀表板需要的欄位，不保存 context breakdown。 */
const toSnapshot = (usage: SessionUsage | SessionMeasureInput): UsageSnapshot => ({
  context: {
    tokens: usage.context.tokens,
    window: usage.context.window,
    percent: usage.context.percent,
  },
  rateLimits: usage.rateLimits.map(({ kind, percentUsed, resetsAt }) => ({ kind, percentUsed, resetsAt })),
  cost: usage.cost ? { usd: usage.cost.usd } : undefined,
})

/** 以引擎時鐘記下「現在」，供重置倒數使用。 */
const stamp = async ($: EngineInterface) => {
  const at = await $.clock.now()
  await update($, now, () => at)
}

/** `$.session.usage()` 不帶 breakdown 時不發任何請求。 */
const refresh = async ($: EngineInterface) => {
  const usage = await $.session.usage()
  await update($, snapshot, () => toSnapshot(usage))
  await stamp($)
}

/** 終端機時區：優先問主機（CLI 環境），失敗則用執行環境的 Date。 */
const detectOffset = async ($: EngineInterface) => {
  try {
    const { exitCode, stdout } = await $.process.run(['date', '+%z'], { timeoutMs: 2000 })
    const parsed = exitCode === 0 ? parseOffset(stdout) : null
    if (parsed !== null) return parsed
  } catch {
    // 非 CLI 宿主或無法執行，改用下方後備值
  }
  return -new Date().getTimezoneOffset()
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: '顯示或隱藏提示框上方的用量儀表板',
    })
    const offset = await detectOffset($)
    await update($, tzOffset, () => offset)
    await refresh($)
    // 只為重置倒數低頻更新時間，不呼叫網路或模型
    $.clock.every(TICK_MS, () => {
      void stamp($)
    })

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await update($, snapshot, () => toSnapshot(e))
    await stamp($)

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId === undefined) {
      await refresh($)
    }

    return result
  })

  on('command.run', { command: COMMAND }, async $ => {
    const hidden = await update($, isHidden, value => !value)

    return { text: hidden ? '用量儀表板已隱藏，再執行一次 /usage-dashboard 可顯示。' : '用量儀表板已顯示。' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isHidden))) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    const columns = e.props.bodyColumns
    const lines = dashboardLines(
      await read($, snapshot),
      (await read($, now)) || (await $.clock.now()),
      (await read($, tzOffset)) ?? -new Date().getTimezoneOffset(),
      columns,
    )
    const labelWidth = columns < NARROW_COLUMNS ? 5 : 12

    return (
      <Box flexDirection="column">
        {lines.slice(0, Math.max(1, e.props.maxRows)).map(line => (
          <Box key={line.key} flexDirection="row">
            <Box width={labelWidth} flexShrink={0}>
              <Text bold wrap="truncate-end">
                {line.label}
              </Text>
            </Box>
            <Text color={line.color} dimColor={line.isDim} wrap="truncate-end">
              {line.body}
            </Text>
          </Box>
        ))}
      </Box>
    )
  })
}
