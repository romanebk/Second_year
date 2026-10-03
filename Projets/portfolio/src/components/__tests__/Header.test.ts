import { describe, it, expect } from 'vitest'

describe('Header component', () => {
  const headerHTML = `
    <div class="sticky lg:hidden top-0 z-30 flex h-16 w-full justify-center bg-opacity-90 backdrop-blur transition-all duration-100 bg-base-100 text-base-content shadow-sm">
      <div class="navbar">
        <div class="navbar-start">
          <label for="my-drawer" class="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>
        </div>
        <div class="navbar-center">
          <a class="btn btn-ghost normal-case text-xl" href="/">Manuel Ernesto ⚡️</a>
        </div>
        <div class="navbar-end"></div>
      </div>
    </div>
  `

  it('renders the title link', () => {
    const container = document.createElement('div')
    container.innerHTML = headerHTML

    const link = container.querySelector('a')
    expect(link).toHaveAttribute('href', '/')
    expect(link?.textContent).toContain('Manuel Ernesto')
  })

  it('has hamburger menu with drawer label', () => {
    const container = document.createElement('div')
    container.innerHTML = headerHTML

    const label = container.querySelector('label')
    expect(label).toHaveAttribute('for', 'my-drawer')
  })

  it('has sticky positioning classes', () => {
    const container = document.createElement('div')
    container.innerHTML = headerHTML

    const div = container.firstElementChild as HTMLElement
    expect(div.className).toContain('sticky')
    expect(div.className).toContain('lg:hidden')
    expect(div.className).toContain('top-0')
    expect(div.className).toContain('z-30')
  })
})
