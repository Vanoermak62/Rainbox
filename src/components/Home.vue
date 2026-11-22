<script setup>
import { ref } from 'vue'
import Error from './Error.vue'
import noRainModal from './noRainModal.vue'

const data = ref([])
const showWeather = ref(false)
const randomCity = ref()
const showNoRain = ref(false)
const isLoading = ref(false)
const isError = ref(false)




const cities = [
    {
        name: 'Tokyo',
        country: 'Japan',
        latitude: 35.6895,
        longitude: 139.6917
    },
    {
        name: 'London',
        country: 'United Kingdom',
        latitude: 51.5074,
        longitude: -0.1278
    },
    {
        name: 'Amsterdam',
        country: 'Netherlands',
        latitude: 52.3676,
        longitude: 4.9041
    },
    {
        name: 'Moscow',
        country: 'Russia',
        latitude: 55.7558,
        longitude: 37.6173
    },
    {
        name: 'Berlin',
        country: 'Germany',
        latitude: 52.52,
        longitude: 13.405
    },
    {
        name: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522
    },
    {
        name: 'New York',
        country: 'United States',
        latitude: 40.7128,
        longitude: -74.006
    },
    {
        name: 'Singapore',
        country: 'Singapore',
        latitude: 1.3521,
        longitude: 103.8198
    },
    {
        name: 'Seoul',
        country: 'South Korea',
        latitude: 37.5665,
        longitude: 126.978
    },
    {
        name: 'Sydney',
        country: 'Australia',
        latitude: -33.8688,
        longitude: 151.2093
    },
    {
        name: 'Minsk',
        country: 'Belarus',
        latitude: 53.9006,
        longitude: 27.559
    }
]



async function getWeather() {
    isError.value = false
    isLoading.value = true
    try {
        data.value = []
        randomCity.value = null
        showNoRain.value = false
        showWeather.value = false
        for (const city of cities) {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&timezone=Europe%2FMoscow&forecast_days=1&hourly=&current=temperature_2m,rain,relative_humidity_2m,wind_speed_10m`)

            if (!response.ok) {
                throw new Error("API error")
            }

            console.log(city.name, city.country)


            const weather = await response.json()



            data.value.push({
                name: city.name,
                country: city.country,
                temperature: weather.current.temperature_2m + weather.current_units.temperature_2m,
                rain: weather.current.rain,
                humidity: weather.current.relative_humidity_2m + weather.current_units.relative_humidity_2m,
                wind: weather.current.wind_speed_10m + weather.current_units.wind_speed_10m
            })

        }

        const rainyCities = data.value.filter(city => city.rain > 0)


        if (rainyCities.length === 0) {
            showNoRain.value = true
            return
        }



        randomCity.value = rainyCities[
            Math.floor(Math.random() * rainyCities.length)
        ]



        console.log(data.value)
        console.log(rainyCities)
        console.log(randomCity.value, randomCity.value.name, randomCity.value.country, randomCity.value.temperature)
        showWeather.value = true
    } catch (err) {
        isError.value = true
        return
    } finally {
        isLoading.value = false
    }




}
function buttonClose() {
    showWeather.value = false
}


// if(data.value.current.rain <= 0)


</script>


<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-background">
        <div class="flex flex-col justify-center items-center">
            <h1 class="text-2xl text-gray p-2 text-foreground">Rainbox</h1>
            <h2 class=" p-2 text-foreground">Find somewhere it's raining.</h2>
            <h2 class=" p-2 text-foreground">Let the rain choose the place.</h2>
            <button
                class="p-2 m-2 border border-border bg-secondary cursor-pointer text-foreground rounded-2xl hover:bg-button-hover"
                @click="getWeather()" :disabled="isLoading">
                <span v-if="isLoading">
                    Searching...
                </span>
                <span v-else>Find the rain</span>
            </button>
        </div>
        <div class="text-foreground flex flex-col justify-center items-center border border-border rounded-2xl pb-4 z-1000 absolute bg-background"
            v-if="showWeather">
            <div class="m-6 flex justify-around flex-col">
                <button class="pb-4 cursor-pointer hover:text-primary w-6%" @click="buttonClose">X</button>
                <h1 class="text-foreground">─── the location found ───</h1>
            </div>
            <h1 class="m-2 p-2">{{ randomCity.name }}</h1>
            <h2 class="m-2 p-2">{{ randomCity.country }} · {{ randomCity.name }}</h2>
            <p class="m-0.5 p-0.5">{{ randomCity.temperature }}</p>
            <p class="m-0.5 p-0.5">{{ randomCity.rain + " mm" }}</p>
            <div class="flex justify-between">
                <p class="mr-8 mt-3">💧 {{ randomCity.humidity
                    }}</p>
                <p class="ml-8 mt-3">~ {{ randomCity.wind }}</p>
            </div>
            <RouterLink to="/room"
                class="p-4 mt-7 border border-border bg-secondary cursor-pointer text-foreground rounded-2xl hover:bg-button-hover">
                Enter Rainbox
            </RouterLink>
        </div>
        <noRainModal v-if="showNoRain" />
        <Error v-if="isError" />
    </div>
</template>