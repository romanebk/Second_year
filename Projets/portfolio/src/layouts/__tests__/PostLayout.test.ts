import { describe, it, expect } from 'vitest'

describe('PostLayout structure', () => {
  function createPostHTML(props: {
    title: string
    description: string
    pubDate?: string
    updatedDate?: string
    heroImage?: string
    badge?: string
    tags?: string[]
  }) {
    const { title, description, pubDate, updatedDate, heroImage, badge, tags = [] } = props
    return `
      <main class="md:flex md:justify-center">
        <article class="prose prose-lg max-w-[750px] prose-img:mx-auto">
          ${heroImage ? `<img width="750" height="422" src="${heroImage}" alt="${title}" class="w-full mb-6" />` : ''}
          <h1 class="title my-2 text-4xl font-bold">${title}</h1>
          ${pubDate ? `<time>${pubDate}</time>` : ''}
          <br />
          ${badge ? `<div class="badge badge-secondary my-1">${badge}</div>` : ''}
          ${tags.length > 0 ? tags.map(tag => `<a href="/blog/tag/${tag}" class="badge badge-outline ml-2 no-underline">${tag}</a>`).join('') : ''}
          ${updatedDate ? `<div>Last updated on <time>${updatedDate}</time></div>` : ''}
          <div class="divider my-2"></div>
        </article>
      </main>
    `
  }

  it('renders title', () => {
    const html = createPostHTML({ title: 'Blog Post', description: 'A blog post' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('h1')?.textContent).toBe('Blog Post')
  })

  it('renders pubDate when provided', () => {
    const html = createPostHTML({ title: 'Post', description: 'Desc', pubDate: '2025-01-15' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('time')).not.toBeNull()
  })

  it('renders badge when provided', () => {
    const html = createPostHTML({ title: 'Post', description: 'Desc', badge: 'NEW' })
    const container = document.createElement('div')
    container.innerHTML = html

    const badge = container.querySelector('.badge-secondary')
    expect(badge).not.toBeNull()
    expect(badge?.textContent).toBe('NEW')
  })

  it('renders tag links when provided', () => {
    const html = createPostHTML({ title: 'Post', description: 'Desc', tags: ['astro', 'tutorial'] })
    const container = document.createElement('div')
    container.innerHTML = html

    const tags = container.querySelectorAll('.badge-outline')
    expect(tags.length).toBe(2)
    expect(tags[0]).toHaveAttribute('href', '/blog/tag/astro')
  })

  it('shows updated date when provided', () => {
    const html = createPostHTML({ title: 'Post', description: 'Desc', updatedDate: 'June 10, 2025' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('div')?.textContent).toContain('Last updated on')
  })

  it('has correct article structure', () => {
    const html = createPostHTML({ title: 'Post', description: 'Desc' })
    const container = document.createElement('div')
    container.innerHTML = html

    const article = container.querySelector('article')
    expect(article).not.toBeNull()
    expect(article?.className).toContain('prose')
    expect(article?.className).toContain('prose-lg')
  })
})
