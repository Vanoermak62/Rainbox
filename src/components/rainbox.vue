<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { Slider } from '@/components/ui/slider'
import { tracks } from '@/data/tracks';

let currentTrackIndex = ref(0)


const currentTrack = computed(() => {
    return tracks[currentTrackIndex.value]
})


const currentTime = ref(0)
const duration = ref(0)


function updateTime() {
    if (!trackAudio.value) return
    currentTime.value = trackAudio.value.currentTime
}


function setDuration() {
    if (!trackAudio.value) return
    duration.value = trackAudio.value.duration || 0
}


const timeline = computed({
    get: () => [currentTime.value],

    set: (value: number[]) => {
        if (!trackAudio.value) return

        trackAudio.value.currentTime = value[0]
        currentTime.value = value[0]
    },
})


function formatTime(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00'

    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)

    return `${minutes}:${String(secs).padStart(2, '0')}`
}


const rainAudio = ref<HTMLAudioElement | null>(null)
const trackAudio = ref<HTMLAudioElement | null>(null)


const isRainPlaying = ref(false)
const isPlaying = ref(false)

const rainVolume = ref([50])

const trackVolume = ref([50])


onMounted(() => {
    console.log('После монтирования:', rainAudio.value)
})


watch(rainVolume, (value) => {
    if (rainAudio.value) {
        rainAudio.value.volume = value[0] / 100
    }
})

watch(trackVolume, (value) => {
    if (trackAudio.value) {
        trackAudio.value.volume = value[0] / 100
    }
})

function nextTrack() {
    currentTrackIndex.value =
        (currentTrackIndex.value + 1) % tracks.length
}

function previousTrack() {
    currentTrackIndex.value =
        (currentTrackIndex.value - 1 + tracks.length) % tracks.length
}


watch(currentTrack, async () => {
    await nextTick()

    if (!trackAudio.value) return

    trackAudio.value.load()

    if (isPlaying.value) {
        try {
            await trackAudio.value.play()
        } catch (error) {
            console.error('Не удалось запустить трек:', error)
            isPlaying.value = false
        }
    }
})


async function toggleRainAudio() {
    console.log('Кнопка нажата')
    console.log('Аудио:', rainAudio.value)

    if (!rainAudio.value) return

    if (isRainPlaying.value) {
        rainAudio.value.pause()
        isRainPlaying.value = false
    } else {
        await rainAudio.value.play()
        isRainPlaying.value = true
    }
}

async function toggleAudio() {
    console.log('Music button clicked')
    console.log('Music audio:', trackAudio.value)

    if (!trackAudio.value) return

    if (isPlaying.value) {
        trackAudio.value.pause()
        isPlaying.value = false
    } else {
        await trackAudio.value.play()
        isPlaying.value = true
    }
}

</script>


<template>

    <div class="relative isolate min-h-screen flex flex-col text-foreground">

        <!-- Фоновое видео -->
        <video class="fixed inset-0 -z-20 h-full w-full object-cover pointer-events-none" autoplay muted loop
            playsinline>
            <source src="/videos/rain.mp4" type="video/mp4" />
        </video>

        <!-- Затемнение фона -->
        <div class="fixed inset-0 -z-10 bg-[#0D0D0F]/55 pointer-events-none"></div>

        <!-- Интерфейс Rainbox -->
        <div class="relative z-10 flex flex-1 flex-col">

            <div class="flex justify-between bg-white/10 backdrop-blur border-b border-white/15 rounded-b-2xl p-4">
                <h1>Rainbox</h1>
                <p>City</p>
            </div>


            <div class="flex flex-1 items-center justify-center flex-col">
                <div class="flex w-[30%] flex-col items-center p-6">
                    <img src="/rainy.png" alt="CloudImage" class="w-12 h-12" />
                    <h1 class="pt-5">Stay a little longer.</h1>
                    <h2 class="pt-5">A quiet place inside the rain.</h2>
                </div>

                <!-- ембиент дождя -->
                <div class="flex justify-between p-5 min-w-250 items-center">
                    <div class="p-6 border border-white/15 bg-white/10 backdrop-blur rounded-2xl w-100">
                        <div class="flex justify-between pb-4">
                            <h1 class="pb-4 pr-5">Rain ambient</h1>
                            <img src="/raindrop.png" class="w-6 h-6" />
                        </div>
                        <div class="flex justify-between border-t pt-5">
                            <audio ref="rainAudio" src="/audio/rain.mp3" loop></audio>
                            <button @click="toggleRainAudio"
                                class="border border-white/30 bg-white/5 backdrop-blur  rounded-2xl p-3 w-15 hover:cursor-pointer">
                                <img src="/play.png" v-if="!isRainPlaying" class="w-full h-full" />
                                <img src="/pause.png" v-else class="w-full h-full" />
                            </button>
                            <div class="w-[80%]">
                                <p class="pl-5">Volume</p>
                                <Slider class="p-4" v-model="rainVolume" :min="0" :max="100" :step="1" />
                            </div>
                        </div>
                    </div>

                    <!-- музло -->
                    <div class="p-6 border border-white/15 bg-white/10 backdrop-blur rounded-2xl w-120">
                        <div class="flex justify-between pb-4">
                            <h1 class="pb-4 pr-5">Music</h1>
                            <img src="/music-note.png" class="w-6 h-6" />
                        </div>
                        <div class="flex justify-between border-t pt-5 items-center">
                            <img src="/змп-обложка.jpg" class="w-15 h-15 rounded-2xl" />
                            <div class="flex">
                                <p class="pl-4 text-foreground text-base">{{ currentTrack.artist }}</p>
                                <p class="pl-1.5 pr-1.5 text-foreground text-base"> - </p>
                                <p class="pr-4 text-foreground text-base">{{ currentTrack.title }}</p>
                            </div>
                            <audio ref="trackAudio" @timeupdate="updateTime" @loadedmetadata="setDuration"
                                :src="currentTrack.src" @ended="nextTrack"></audio>
                            <div class="w-[25%]">
                                <p class="pl-2">Volume</p>
                                <Slider class="p-4" v-model="trackVolume" :min="0" :max="100" :step="1" />
                            </div>
                        </div>
                        <div class="pt-5">
                            <Slider v-model="timeline" :min="0" :max="duration || 1" :step="0.1"
                                :disabled="duration === 0" />
                            <div class="flex justify-between text-sm text-muted-foreground pt-4">
                                <span>{{ formatTime(currentTime) }}</span>
                                <span>{{ formatTime(duration) }}</span>
                            </div>
                        </div>
                        <div class="flex justify-between pt-4">
                            <img src="/backward.png" @click="previousTrack"
                                class="w-12 h-12 p-2 border border-white/30 bg-white/5 backdrop-blur hover:cursor-pointer rounded-2xl" />
                            <button @click="toggleAudio"
                                class="border  border-white/30 bg-white/5 backdrop-blur rounded-2xl hover:cursor-pointer p-3 w-12 h-12">
                                <img src="/play.png" v-if="!isPlaying" class="w-full h-full" />
                                <img src="/pause.png" v-else class="w-full h-full" />
                            </button>
                            <img src="/forward.png" @click="nextTrack"
                                class="w-12 h-12 p-2 border rounded-2xl border-white/30 bg-white/5 hover:cursor-pointer backdrop-blur" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-between border-t border-white/15 bg-white/10 backdrop-blur rounded-t-2xl p-4">
                <h1>A moment away from everything</h1>
                <h1>0{{ currentTrackIndex + 1 }}/NIGHT</h1>
            </div>

        </div>
    </div>
</template>
