import { stringifyLog } from './replay'

export type ReplayParams = {
  player?: 1 | -1
  level?: number
  log?: number[]
}

export function buildReplayUrl(baseUrl: string, params: ReplayParams): string {
  const u = new URL(baseUrl)
  u.searchParams.set('replay', '1')
  if (params.player != null) u.searchParams.set('player', String(params.player))
  if (params.level != null) u.searchParams.set('level', String(params.level))
  if (params.log && params.log.length > 0) u.searchParams.set('log', stringifyLog(params.log))
  return u.toString()
}

export function buildReplayQuery(params: ReplayParams): string {
  const sp = new URLSearchParams()
  sp.set('replay', '1')
  if (params.player != null) sp.set('player', String(params.player))
  if (params.level != null) sp.set('level', String(params.level))
  if (params.log && params.log.length > 0) sp.set('log', stringifyLog(params.log))
  const s = sp.toString()
  return s ? `?${s}` : ''
}

export function clearReplayParams(url: string): string {
  const u = new URL(url)
  u.searchParams.delete('replay')
  u.searchParams.delete('player')
  u.searchParams.delete('level')
  u.searchParams.delete('log')
  return u.toString()
}

