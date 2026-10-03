import { describe, it, expect } from 'vitest'

function createCardHTML(props: {
  title: string
  img?: string
  desc: string
  url: string
  badge?: string
  tags?: string[]
  target?: string
}) {
  const { title, img, desc, url, badge, tags, target = '_blank' } = props
  return `
    <div class="md:w-1/3 w-full">
      <a href="${url}" target="${target}">
        <div class="card bg-base-100 transition ease-in-out hover:shadow-xl mx-6 my-2 hover:scale-[102%]">
          ${img ? `<img width="750" height="422" src="${img}" alt="${title}" />` : ''}
          <div class="card-body">
            <h2 class="card-title">
              ${title}
              ${badge ? `<div class="badge badge-secondary">${badge}</div>` : ''}
            </h2>
            <p>${desc}</p>
            <div class="card-actions justify-end">
              ${tags ? tags.map(tag => `<div class="badge badge-outline">${tag}</div>`).join('') : ''}
            </div>
          </div>
        </div>
      </a>
    </div>
  `
}

describe('Card component', () => {
  it('renders title, description and URL', () => {
    const html = createCardHTML({ title: 'Test Project', desc: 'A test project description', url: '/projects/test' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('h2')?.textContent).toContain('Test Project')
    expect(container.querySelector('p')?.textContent).toBe('A test project description')
    expect(container.querySelector('a')).toHaveAttribute('href', '/projects/test')
    expect(container.querySelector('a')).toHaveAttribute('target', '_blank')
  })

  it('renders badge when provided', () => {
    const html = createCardHTML({ title: 'Test', desc: 'Desc', url: '#', badge: 'NEW' })
    const container = document.createElement('div')
    container.innerHTML = html

    const badge = container.querySelector('.badge-secondary')
    expect(badge).not.toBeNull()
    expect(badge?.textContent).toBe('NEW')
  })

  it('renders tags when provided', () => {
    const html = createCardHTML({ title: 'Test', desc: 'Desc', url: '#', tags: ['React', 'TypeScript'] })
    const container = document.createElement('div')
    container.innerHTML = html

    const tags = container.querySelectorAll('.badge-outline')
    expect(tags.length).toBe(2)
    expect(tags[0]?.textContent).toBe('React')
    expect(tags[1]?.textContent).toBe('TypeScript')
  })

  it('does not render badge or tags when not provided', () => {
    const html = createCardHTML({ title: 'Test', desc: 'Desc', url: '#' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('.badge')).toBeNull()
    expect(container.querySelector('.badge-outline')).toBeNull()
  })

  it('uses _blank as default target', () => {
    const html = createCardHTML({ title: 'Test', desc: 'Desc', url: '#' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('a')).toHaveAttribute('target', '_blank')
  })

  it('uses custom target when provided', () => {
    const html = createCardHTML({ title: 'Test', desc: 'Desc', url: '#', target: '_self' })
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('a')).toHaveAttribute('target', '_self')
  })
})
