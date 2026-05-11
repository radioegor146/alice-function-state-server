import { StateProvider } from './types'

export class DummyStateProvider extends StateProvider {
  constructor (name: string,
    description: string,
    private readonly value: string) {
    super(name, description)
  }

  getValue (): Promise<string> {
    return Promise.resolve(this.value)
  }
}
