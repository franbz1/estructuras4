let sequence = 0

export function createId(prefix: string): string {
  sequence += 1
  return `${prefix}-${Date.now()}-${sequence}`
}
