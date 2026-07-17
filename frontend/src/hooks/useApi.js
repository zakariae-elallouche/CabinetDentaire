import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'

export function useApiQuery(key, url, options = {}) {
  const { params, enabled, ...queryOptions } = options
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key, params],
    queryFn: () => api.get(url, { params }).then(r => r.data),
    enabled,
    ...queryOptions,
  })
}

export function useApiMutation(method, url, options = {}) {
  const queryClient = useQueryClient()
  const { invalidate, ...mutationOptions } = options
  return useMutation({
    mutationFn: (data) => {
      const config = typeof data === 'object' && data !== null && data._config
        ? data._config
        : {}
      if (method === 'delete') return api[method](url, config)
      if (method === 'put' || method === 'patch') return api[method](url, data, config)
      return api[method](url, data, config)
    },
    onSuccess: (...args) => {
      if (invalidate) {
        const keys = Array.isArray(invalidate) ? invalidate : [invalidate]
        keys.forEach(k => queryClient.invalidateQueries({ queryKey: typeof k === 'string' ? [k] : k }))
      }
      mutationOptions.onSuccess?.(...args)
    },
    onError: (error) => {
      mutationOptions.onError?.(error)
    },
    ...mutationOptions,
  })
}
