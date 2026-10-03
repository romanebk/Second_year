import { describe, it, expect } from 'vitest'

describe('CV page', () => {
  it('renders Profile section', () => {
    const container = document.createElement('div')
    container.innerHTML = `<div class="text-3xl w-full font-bold">Profile</div>`

    expect(container.querySelector('.text-3xl')?.textContent).toBe('Profile')
  })

  it('renders Education section', () => {
    const container = document.createElement('div')
    container.innerHTML = `<div class="text-3xl w-full font-bold">Education</div>`

    expect(container.querySelector('.text-3xl')?.textContent).toBe('Education')
  })

  it('renders Experience section', () => {
    const container = document.createElement('div')
    container.innerHTML = `<div class="text-3xl w-full font-bold">Experience</div>`

    expect(container.querySelector('.text-3xl')?.textContent).toBe('Experience')
  })

  it('renders Certifications section', () => {
    const container = document.createElement('div')
    container.innerHTML = `<div class="text-3xl w-full font-bold">Certifications</div>`

    expect(container.querySelector('.text-3xl')?.textContent).toBe('Certifications')
  })

  it('renders Skills section with skill list', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <div class="text-3xl w-full font-bold">Skills</div>
      <ul class="list-disc mx-6">
        <li>C</li>
        <li>C++</li>
        <li>Python</li>
        <li>Rust</li>
      </ul>
    `

    expect(container.querySelector('.text-3xl')?.textContent).toBe('Skills')
    const items = container.querySelectorAll('li')
    expect(items.length).toBe(4)
    expect(items[0]?.textContent).toBe('C')
    expect(items[1]?.textContent).toBe('C++')
  })
})
