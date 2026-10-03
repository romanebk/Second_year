import { describe, it, expect, vi } from 'vitest'

vi.mock('../../config', () => ({
  GENERATE_SLUG_FROM_TITLE: true,
}))

import createSlug from '../createSlug'

describe('createSlug', () => {
  it('generates slug from title', () => {
    expect(createSlug('Hello World', 'static-slug')).toBe('hello-world')
  })

  it('handles special characters in title', () => {
    expect(createSlug('Hello, World! How are you?', 'ignored')).toBe('hello-world-how-are-you')
  })

  it('handles multiple spaces', () => {
    expect(createSlug('Hello   World', 'ignored')).toBe('hello-world')
  })

  it('handles leading and trailing whitespace', () => {
    expect(createSlug('  Hello World  ', 'ignored')).toBe('hello-world')
  })

  it('handles leading and trailing hyphens', () => {
    expect(createSlug('-Hello World-', 'ignored')).toBe('hello-world')
  })

  it('lowercases the title', () => {
    expect(createSlug('HELLO WORLD', 'ignored')).toBe('hello-world')
  })

  it('removes non-word characters', () => {
    expect(createSlug('Hello@World! #Test', 'ignored')).toBe('helloworld-test')
  })
})
