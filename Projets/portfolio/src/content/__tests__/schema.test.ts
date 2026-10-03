import { describe, it, expect } from 'vitest'

describe('Content schemas', () => {
  it('exports collections', async () => {
    const config = await import('../config')
    expect(config.collections).toBeDefined()
    expect(config.collections.blog).toBeDefined()
    expect(config.collections.store).toBeDefined()
  })
})
