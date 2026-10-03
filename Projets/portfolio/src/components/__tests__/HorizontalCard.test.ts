import { describe, it, expect } from 'vitest'

describe('HorizontalCard component', () => {
  function createHorizontalCardHTML(props: {
    title: string
    img?: string
    desc: string
    url: string
    badge?: string
    tags?: string[]
    target?: string
  }) {
    const { title, img, desc, url, badge, tags, target = '_blank' } = props
    const tag_url = url.split('/').slice(0, -1).join('/') + '/tag'
    return `
      <div class="rounded-lg bg-base-100 hover:shadow-xl transition ease-in-out hover:scale-[102%]">
        <a href="${url}" target="${target}">
          <div class="hero-content flex-col md:flex-row">
            ${img ? `<img src="${img}" width="750" height="422" alt="${title}" class="max-w-full md:max-w-[13rem] rounded-lg" />` : ''}
            <div class="grow w-full">
              <h1 class="text-xl font-bold">${title}</h1>
              ${badge ? `<div class="badge badge-secondary mx-2">${badge}</div>` : ''}
              <p class="py-1 text-1xl">${desc}</p>
              <div class="card-actions justify-end">
                ${tags ? tags.map(tag => `<a href="${tag_url}/${tag}" class="badge badge-outline">${tag}</a>`).join('') : ''}
              </div>
            </div>
          </div>
        </a>
      </div>
    `
  }

  it('renders title, description and link', () => {
    const html = createHorizontalCardHTML({ title: 'My Project', desc: 'Project description', url: '/projects/my-project' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('h1')?.textContent).toContain('My Project')
    expect(container.querySelector('p')?.textContent).toBe('Project description')
    expect(container.querySelector('a')).toHaveAttribute('href', '/projects/my-project')
  })

  it('renders badge when provided', () => {
    const html = createHorizontalCardHTML({ title: 'Test', desc: 'Desc', url: '#', badge: 'HOT' })
    const container = document.createElement('div')
    container.innerHTML = html

    const badge = container.querySelector('.badge-secondary')
    expect(badge).not.toBeNull()
    expect(badge?.textContent).toBe('HOT')
  })

  it('renders tag links when provided', () => {
    const html = createHorizontalCardHTML({ title: 'Test', desc: 'Desc', url: '/blog/my-post', tags: ['astro', 'tailwind'] })
    const container = document.createElement('div')
    container.innerHTML = html

    const tags = container.querySelectorAll('.badge-outline')
    expect(tags.length).toBe(2)
    expect(tags[0]).toHaveAttribute('href', '/blog/tag/astro')
    expect(tags[1]).toHaveAttribute('href', '/blog/tag/tailwind')
  })

  it('uses _blank as default target', () => {
    const html = createHorizontalCardHTML({ title: 'Test', desc: 'Desc', url: '#' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('a')).toHaveAttribute('target', '_blank')
  })
})
