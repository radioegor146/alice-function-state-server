import z from 'zod'

import { HTTPJSONStateProvider, HTTPJSONStateProviderConfig } from './http-json'

export type YncaNowPlayingStateProviderConfig = HTTPJSONStateProviderConfig

const yncaDataType = z.object({
  media: z.object({
    album: z.string().nullable().optional(),
    artist: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
  })
})

export class YncaNowPlayingStateProvider extends HTTPJSONStateProvider {
  constructor (name: string, description: string, url: string) {
    super(name, description, url, rawData => {
      const data = yncaDataType.parse(rawData)
      if ((!data.media.album || data.media.album === 'N/A') &&
                (!data.media.artist || data.media.artist === 'N/A') &&
                (!data.media.title || data.media.title === 'N/A')) {
        return 'nothing is playing right now'
      }
      return `${data.media.artist} - ${data.media.title}`
    })
  }

  static create (config: YncaNowPlayingStateProviderConfig): YncaNowPlayingStateProvider {
    return new YncaNowPlayingStateProvider(config.name, config.description, config.url)
  }
}
export { configValidator } from './http-json'
