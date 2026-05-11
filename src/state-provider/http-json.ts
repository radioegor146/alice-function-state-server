import z from 'zod'

import { configValidator as baseConfigValidator, StateProvider, StateProviderConfig } from './types'

export interface HTTPJSONStateProviderConfig extends StateProviderConfig {
  url: string;
}

export const configValidator = z.intersection(z.object({
  url: z.string()
}), baseConfigValidator)

export class HTTPJSONStateProvider extends StateProvider {
  constructor (name: string, description: string,
    private readonly url: string,
    private readonly extractor: (data: unknown) => string) {
    super(name, description)
  }

  async getValue (): Promise<string> {
    const response = await fetch(this.url)
    return this.extractor(await response.json())
  }
}
