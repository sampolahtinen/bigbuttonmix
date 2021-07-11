import { CONFIG, __DEV__ } from '../config/index';

export type SoundcloudEmbedResponse = {
    author_name: string,
    author_url: string,
    description: string,
    height: number,
    html: string,
    provider_name: string,
    provider_url: string,
    thumbnail_url: string,
    title: string,
    type: string,
    version: number,
    width: number
}

export const getRandomMixtape = async (city?: string) => {
    console.log('getting')
    const url =  __DEV__ ? '/api/random-mix' : `${CONFIG.baseUrl}/api/random-mix`
    // const url =  __DEV__ ? '/api/random-mix' : `${CONFIG.baseUrl}/api/random-mix`
    return fetch(url)
}