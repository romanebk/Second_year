import { describe, it, expect } from 'vitest'

describe('Home page (index.astro)', () => {
  it('has navigation buttons', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <div class="mt-8">
        <a class="btn" href="/projects" target="_self">Voir mes projets</a>
        <a href="/cv" target="_self" class="btn btn-outline ml-5">Mon CV</a>
      </div>
    `

    const projectsBtn = container.querySelector('a[href="/projects"]')
    expect(projectsBtn).not.toBeNull()
    expect(projectsBtn?.textContent).toContain('Voir mes projets')
    expect(projectsBtn).toHaveAttribute('target', '_self')

    const cvBtn = container.querySelector('a[href="/cv"]')
    expect(cvBtn).not.toBeNull()
    expect(cvBtn?.textContent).toContain('Mon CV')
    expect(cvBtn).toHaveAttribute('target', '_self')
  })

  it('has a link to see all projects', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <div class="mt-8 text-center">
        <a href="/projects" class="btn btn-outline btn-lg">Voir tous les projets →</a>
      </div>
    `

    const seeAll = container.querySelector('a[href="/projects"]')
    expect(seeAll).not.toBeNull()
    expect(seeAll?.textContent).toContain('Voir tous les projets')
  })
})
