import { defineStore } from 'pinia'

import type { GameMeta } from '~/utils/jeopardy/types';
export const useAuthStore = defineStore('Auth', () => {

  const { data, status } = useFetch<GameMeta[]>('/api/mygames')
  return { data, status }
})
