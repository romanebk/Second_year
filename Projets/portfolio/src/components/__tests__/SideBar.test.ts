import { describe, it, expect } from 'vitest'

describe('SideBar component', () => {
  it('renders drawer-side structure', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <div class="drawer-side z-40">
        <label for="my-drawer" class="drawer-overlay"></label>
        <aside class="px-2 pt-2 h-auto min-h-full w-[19rem] bg-base-200 text-base-content flex flex-col">
          <div class="w-fit mx-auto mt-5 mb-6">
            <a href="/">
              <div class="avatar transition ease-in-out hover:scale-[102%] block m-auto">
                <div class="w-[8.5rem]">
                  <img class="mask mask-circle" width="300" height="300" src="/profile.webp" alt="Profile image" />
                </div>
              </div>
            </a>
          </div>
        </aside>
      </div>
    `

    const drawerSide = container.querySelector('.drawer-side')
    expect(drawerSide).not.toBeNull()
    expect(drawerSide?.className).toContain('z-40')

    const overlay = container.querySelector('.drawer-overlay')
    expect(overlay).not.toBeNull()
    expect(overlay).toHaveAttribute('for', 'my-drawer')

    const profileImage = container.querySelector('img[alt="Profile image"]')
    expect(profileImage).not.toBeNull()
    expect(profileImage).toHaveAttribute('src', '/profile.webp')
    expect(profileImage?.className).toContain('mask-circle')

    const homeLink = container.querySelector('a[href="/"]')
    expect(homeLink).not.toBeNull()
  })
})
