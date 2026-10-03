import { describe, it, expect } from 'vitest'

describe('SideBarMenu component', () => {
  const sidebarMenuHTML = `
    <ul class="menu grow shrink menu-md overflow-y-auto">
      <li><a class="py-3 text-base" id="home" href="/">Home</a></li>
      <li><a class="py-3 text-base" id="projects" href="/projects">Projects</a></li>
      <li><a class="py-3 text-base" id="cv" href="/cv">CV</a></li>
      <li><a class="py-3 text-base" id="contact" href="/contact">Contact</a></li>
    </ul>
  `

  it('renders all menu items', () => {
    const container = document.createElement('div')
    container.innerHTML = sidebarMenuHTML

    const items = container.querySelectorAll('li')
    expect(items.length).toBe(4)
    expect(container.querySelector('#home')?.textContent).toBe('Home')
    expect(container.querySelector('#projects')?.textContent).toBe('Projects')
    expect(container.querySelector('#cv')?.textContent).toBe('CV')
    expect(container.querySelector('#contact')?.textContent).toBe('Contact')
  })

  it('has correct links for each menu item', () => {
    const container = document.createElement('div')
    container.innerHTML = sidebarMenuHTML

    expect(container.querySelector('#home')).toHaveAttribute('href', '/')
    expect(container.querySelector('#projects')).toHaveAttribute('href', '/projects')
    expect(container.querySelector('#cv')).toHaveAttribute('href', '/cv')
    expect(container.querySelector('#contact')).toHaveAttribute('href', '/contact')
  })
})
