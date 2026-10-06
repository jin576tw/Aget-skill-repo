import { expect, test } from 'claude-code/testing'

import { dashboardLines, parseOffset, resetText } from '../hooks/format'

const NOW = Date.parse('2026-10-06T06:00:00Z')

test('尚無讀數時顯示等待首筆用量', async () => {
  const lines = dashboardLines(null, NOW, 480, 120)
  expect(lines.map(line => line.body)).toEqual(['等待首筆用量', '等待首筆用量'])
})

test('context 顯示剩餘 token，方案額度只給百分比', async () => {
  const lines = dashboardLines(
    {
      context: { tokens: 50_000, window: 200_000, percent: 25 },
      rateLimits: [
        { kind: 'seven_day', percentUsed: 40, resetsAt: '2026-10-09T06:00:00Z' },
        { kind: 'five_hour', percentUsed: 23.5, resetsAt: '2026-10-06T08:13:00Z' },
      ],
      cost: { usd: 1.234 },
    },
    NOW,
    480,
    120,
  )
  expect(lines[0]?.body).toContain('剩餘 150,000 tokens')
  expect(lines[1]?.label).toBe('5 小時額度')
  expect(lines[1]?.body).toContain('剩餘 76.5%')
  expect(lines[1]?.body).toContain('16:13 重置（2h13m 後）')
  expect(lines[2]?.label).toBe('7 天額度')
  expect(lines[2]?.body).not.toMatch(/token/)
  expect(lines[3]?.body).toContain('非訂閱方案 token 餘額')
})

test('有讀數但無 rateLimits 時說明未提供', async () => {
  const lines = dashboardLines({ context: { tokens: 10, window: 100 }, rateLimits: [] }, NOW, 0, 120)
  expect(lines[1]?.body).toBe('此登入方式未提供方案額度')
})

test('超過 100%、過期與無效重置時間、窄版', async () => {
  const lines = dashboardLines(
    { context: { tokens: 10, window: 100 }, rateLimits: [{ kind: 'spend_limit', percentUsed: 120.5, resetsAt: '2026-10-06T05:00:00Z' }] },
    NOW,
    0,
    40,
  )
  expect(lines[1]?.body).toBe('剩0% 超額 已重置')
  expect(resetText('bad', NOW, 0, false)).toBe('重置時間無法解析')
  expect(parseOffset('+0800\n')).toBe(480)
  expect(parseOffset('-0330')).toBe(-210)
})
