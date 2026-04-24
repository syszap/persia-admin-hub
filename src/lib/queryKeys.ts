/**
 * Centralised query-key factory.
 *
 * Rules:
 *  • Every key is a readonly tuple — enables precise invalidation.
 *  • Namespace first, then sub-resource, then filters.
 *  • Use `.all()` when invalidating an entire domain (e.g. after a mutation).
 */

export const queryKeys = {
  users: {
    all: ()                           => ['users'] as const,
    list: ()                          => ['users', 'list'] as const,
    detail: (id: string)              => ['users', 'detail', id] as const,
  },

  cheques: {
    all: ()                                                        => ['cheques'] as const,
    list: (page: number, filters: Record<string, unknown>)         => ['cheques', 'list', page, filters] as const,
    summary: ()                                                    => ['cheques', 'summary'] as const,
    customers: (page: number, filters: Record<string, unknown>)    => ['cheques', 'customers', page, filters] as const,
  },

  roles: {
    all: ()                => ['roles'] as const,
    detail: (id: string)   => ['roles', 'detail', id] as const,
  },

  featureFlags: {
    all: () => ['feature-flags'] as const,
  },

  audit: {
    all: ()                                                    => ['audit'] as const,
    list: (filters?: Record<string, unknown>)                  => ['audit', 'list', filters] as const,
  },
} as const;
