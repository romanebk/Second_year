function createChainable(overrides: Record<string, any> = {}): any {
  return new Proxy(
    {},
    {
      get(_target, prop: string) {
        if (prop === 'optional') return () => createChainable()
        if (prop === 'refine') return () => createChainable()
        if (prop in overrides) return overrides[prop]
        return () => createChainable()
      },
    },
  )
}

export const z = {
  object: (_shape: any) => createChainable(),
  string: () => createChainable(),
  coerce: {
    date: () => createChainable(),
  },
  array: () => createChainable(),
}

export function defineCollection(_config: { schema: any }) {
  return createChainable()
}
