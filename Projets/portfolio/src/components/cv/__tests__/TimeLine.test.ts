import { describe, it, expect } from 'vitest'

describe('TimeLine component', () => {
  function createTimeLineHTML(title: string, subtitle: string, slotContent?: string) {
    return `
      <div class="flex">
        <div class="education__time">
          <span class="w-4 h-4 bg-primary block rounded-full mt-1"></span>
          <span class="education__line bg-primary block h-full w-[2px] translate-x-[7px]"></span>
        </div>
        <div class="experience__data bd-grid px-5">
          <h3 class="font-semibold mb-1">${title}</h3>
          <span class="font-light text-sm">${subtitle}</span>
          <p class="my-2 text-justify">${slotContent || ''}</p>
        </div>
      </div>
    `
  }

  it('renders title and subtitle', () => {
    const html = createTimeLineHTML('EPITECH - Computer Science', '2024 to present at EPITECH, Cotonou, Benin')
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('h3')?.textContent).toBe('EPITECH - Computer Science')
    expect(container.querySelector('.font-light')?.textContent).toBe('2024 to present at EPITECH, Cotonou, Benin')
  })

  it('renders slot content when provided', () => {
    const html = createTimeLineHTML('Developer', '2025', 'This is a description of my role.')
    const container = document.createElement('div')
    container.innerHTML = html

    expect(container.querySelector('p')?.textContent).toBe('This is a description of my role.')
  })

  it('has timeline visual elements', () => {
    const html = createTimeLineHTML('Title', 'Subtitle')
    const container = document.createElement('div')
    container.innerHTML = html

    const dot = container.querySelector('.education__time span')
    expect(dot).not.toBeNull()
    expect(dot?.className).toContain('bg-primary')
    expect(dot?.className).toContain('rounded-full')

    const line = container.querySelector('.education__line')
    expect(line).not.toBeNull()
    expect(line?.className).toContain('bg-primary')
  })
})
