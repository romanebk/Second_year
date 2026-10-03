import { describe, it, expect } from 'vitest'

describe('Site config', () => {
  it('has a SITE_TITLE defined and non-empty', async () => {
    const { SITE_TITLE } = await import('../../config')
    expect(SITE_TITLE).toBeDefined()
    expect(SITE_TITLE.length).toBeGreaterThan(0)
  })

  it('has a SITE_DESCRIPTION defined and non-empty', async () => {
    const { SITE_DESCRIPTION } = await import('../../config')
    expect(SITE_DESCRIPTION).toBeDefined()
    expect(SITE_DESCRIPTION.length).toBeGreaterThan(0)
  })

  it('GENERATE_SLUG_FROM_TITLE is a boolean', async () => {
    const { GENERATE_SLUG_FROM_TITLE } = await import('../../config')
    expect(typeof GENERATE_SLUG_FROM_TITLE).toBe('boolean')
  })

  it('TRANSITION_API is a boolean', async () => {
    const { TRANSITION_API } = await import('../../config')
    expect(typeof TRANSITION_API).toBe('boolean')
  })
})
