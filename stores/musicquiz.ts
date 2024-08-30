import {defineStore} from "pinia";

export const useMusicQuizStore = defineStore('musicquiz', () => {
    const gamemode = ref('guess')
    const levelnum = ref(0)
    const revealed = ref(false)
    const currentSongData = ref('')
    const currentSongText = computed(() => {
        return '0/40'
    })
    return { gamemode, levelnum, revealed, currentSongText }
})
