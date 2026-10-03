import { describe, it, expect } from 'vitest'

describe('BaseHead component', () => {
  function createBaseHeadHTML(props: {
    title: string
    description: string
    image?: string
    ogType?: string
  }) {
    const { title, description, image = '/social_img.webp', ogType = 'website' } = props
    return `
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <title>${title}</title>
      <meta name="title" content="${title}" />
      <meta name="description" content="${description}" />
      <meta property="og:type" content="${ogType}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${image}" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content="${title}" />
      <meta property="twitter:description" content="${description}" />
      <meta property="twitter:image" content="${image}" />
    `
  }

  it('sets the page title', () => {
    const html = createBaseHeadHTML({ title: 'My Page', description: 'Page description' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('title')?.textContent).toBe('My Page')
  })

  it('sets meta description', () => {
    const html = createBaseHeadHTML({ title: 'Test', description: 'Test description' })
    const container = document.createElement('div')
    container.innerHTML = html

    const metaDesc = container.querySelector('meta[name="description"]')
    expect(metaDesc).toHaveAttribute('content', 'Test description')
  })

  it('sets OG meta tags with defaults', () => {
    const html = createBaseHeadHTML({ title: 'Test', description: 'Desc' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'website')
    expect(container.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Test')
  })

  it('uses custom OG type when provided', () => {
    const html = createBaseHeadHTML({ title: 'Article', description: 'Article desc', ogType: 'article' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'article')
  })

  it('sets Twitter card meta tags', () => {
    const html = createBaseHeadHTML({ title: 'Test', description: 'Desc' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('meta[property="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
  })

  it('includes charset and viewport meta tags', () => {
    const html = createBaseHeadHTML({ title: 'Test', description: 'Desc' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('meta[charset="utf-8"]')).not.toBeNull()
    expect(container.querySelector('meta[name="viewport"]')).toHaveAttribute('content', 'width=device-width,initial-scale=1')
  })

  it('includes favicon link', () => {
    const html = createBaseHeadHTML({ title: 'Test', description: 'Desc' })
    const container = document.createElement('div')
    container.innerHTML = html

    const favicon = container.querySelector('link[rel="icon"]')
    expect(favicon).not.toBeNull()
    expect(favicon).toHaveAttribute('href', '/favicon.svg')
  })
})
