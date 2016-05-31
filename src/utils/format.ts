export function formatDuration(time: number): string {
  const t = Math.round(time)
  const min = Math.floor(t / 60)
  const sec = t % 60
  return `${('0' + min).slice(-2)}:${('0' + sec).slice(-2)}`
}
