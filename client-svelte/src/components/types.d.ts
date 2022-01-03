/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface Locals {
  userid: string;
}

export type SoundcloudEmbedResponse = {
  author_name: string;
  author_url: string;
  description: string;
  height: number;
  html: string;
  provider_name: string;
  provider_url: string;
  thumbnail_url: string;
  title: string;
  type: string;
  version: number;
  width: number;
};
