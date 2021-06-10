import { CONFIG } from '../config/index';

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

export const getRandomMixtape = async (city: string) => {
    console.log('getting')
    const url = CONFIG.baseUrl + '/api/random-mix'
    return fetch(url)
}