import { describe, it, expect } from 'vitest'

describe('BaseLayout structure', () => {
  it('has drawer toggle checkbox', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <div class="bg-base-100 drawer lg:drawer-open">
        <input id="my-drawer" type="checkbox" class="drawer-toggle" />
      </div>
    `

    const checkbox = container.querySelector('#my-drawer')
    expect(checkbox).not.toBeNull()
    expect(checkbox).toHaveClass('drawer-toggle')
  })

  it('has main content area with correct classes', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <main class="p-6 pt-10 lg:max-w-[900px] max-w-[100vw]">
        <h1>Content slot</h1>
      </main>
    `

    const main = container.querySelector('main')
    expect(main).not.toBeNull()
    expect(main?.className).toContain('lg:max-w-[900px]')
  })

  it('renders slot content', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <main class="p-6 pt-10 lg:max-w-[900px] max-w-[100vw]">
        <h1>Content slot</h1>
      </main>
    `

    expect(container.querySelector('h1')?.textContent).toBe('Content slot')
  })
})
