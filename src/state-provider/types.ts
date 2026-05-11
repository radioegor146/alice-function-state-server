import z from 'zod'

export interface StateProviderConfig {
  description: string;
  name: string;
}

export const configValidator = z.object({
  description: z.string()
})

export abstract class StateProvider {
  protected constructor (private readonly name: string, private readonly description: string) {}

  getDescription (): string {
    return this.description
  }

  getName (): string {
    return this.name
  }

  abstract getValue (): Promise<string>
}
