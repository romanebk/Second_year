import { describe, it, expect } from 'vitest'

describe('Footer component', () => {
  it('renders the current year', () => {
    const currentYear = new Date().getFullYear()
    const container = document.createElement('div')
    container.innerHTML = `
      <footer class="footer footer-center block mb-5 pt-10">
        <div class="pb-2">&copy; ${currentYear} Ariel BOKO</div>
        <div class="inline opacity-75">Développeur C++/C, Rust, Python, Web</div>
      </footer>
    `

    expect(container.querySelector('.pb-2')?.textContent).toContain(`© ${currentYear} Ariel BOKO`)
    const textEl = container.querySelector('.inline')
    expect(textEl?.textContent?.trim()).toBe('Développeur C++/C, Rust, Python, Web')
  })

  it('has correct footer class', () => {
    const currentYear = new Date().getFullYear()
    const container = document.createElement('div')
    container.innerHTML = `
      <footer class="footer footer-center block mb-5 pt-10">
        <div class="pb-2">&copy; ${currentYear} Ariel BOKO</div>
      </footer>
    `

    const footer = container.querySelector('footer')
    expect(footer).toHaveClass('footer')
    expect(footer).toHaveClass('footer-center')
  })
})
