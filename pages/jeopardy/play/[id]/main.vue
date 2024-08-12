<script lang="ts" setup>

const jeopardy = useJeopardyStore();
const { jdata: jAllData, users } = storeToRefs(jeopardy);
const jdata = computed(() => jAllData.value?.categories);

</script>

<template>
    <div v-if="jdata" style="background-image: linear-gradient(#8902c7, #4402c7);" class="min-h-screen">
        <div class="flex flex-col justify-start items-center">
            <div class="flex justify-evenly items-start min-w-full" style="min-height: 50vh;">
                <div v-for="cat of Object.keys(jdata)" class="mt-5 flex flex-col items-center">
                    <TextBox class="px-8">{{ cat }}</TextBox>
                    <div class="justify-start items-center w-full h-full mt-5">
                        <div v-for="q of Object.keys(jdata[cat])" class="flex justify-center items-center mt-4">
                            <TextBox class="px-12" :class="jdata[cat][Number.parseInt(q)].used ? '!bg-[#505050]' : ''">
                                {{
                                    q
                                }}</TextBox>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="users" class="flex justify-around items-center min-w-full mt-10">
                <div v-for="user of Object.keys(users)" class="flex flex-col items-center justify-end gap-8 h-full">
                    <div class="flex justify-evenly w-48">
                        <template v-if="jAllData" v-for="joker of jAllData.jokers">
                            <div v-if="users[user].jokers != undefined"
                                class="w-12 h-12 rounded-full flex justify-center items-center text-3xl text-white"
                                :class="{ 'bg-[#888888]': !(users[user].jokers.includes(joker)), 'bg-[#007800]': users[user].jokers.includes(joker) }">

                                {{ joker }}
                            </div>
                        </template>
                    </div>
                    <img class="w-52 rounded-full"
                        :class="{ 'border-yellow-400 border-4': user == jeopardy.currentUser }"
                        :src="users[user].avatarUrl" :alt="user">
                    <TextBox class="px-2">{{ users[user].points }}</TextBox>
                </div>
            </div>
        </div>
    </div>
</template>