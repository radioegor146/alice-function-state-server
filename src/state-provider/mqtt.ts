import { MqttClient } from 'mqtt'
import z from 'zod'

import { getLogger } from '../logger'
import { StateProvider, StateProviderConfig } from './types'
import { configValidator as baseConfigValidator } from './types'

export interface MQTTStateProviderConfig extends StateProviderConfig {
  topic: string;
}

export interface MQTTStateProviderDependencies {
  mqtt: MqttClient;
}

export const configValidator = z.intersection(z.object({
  topic: z.string()
}), baseConfigValidator)

export class MQTTStateProvider extends StateProvider {
  private readonly logger = getLogger<MQTTStateProvider>()

  private state: string = 'unknown'

  constructor (name: string, description: string,
    mqtt: MqttClient,
    private readonly topic: string) {
    super(name, description)
    mqtt.subscribe(this.topic)
    mqtt.on('message', (topic, payload) => {
      if (topic !== this.topic) {
        return
      }
      const value = payload.toString('utf8')
      this.logger.info(`Received from '${this.topic}' '${value}'`)
      this.state = value
    })
  }

  static create (config: MQTTStateProviderConfig,
    dependencies: MQTTStateProviderDependencies): MQTTStateProvider {
    return new MQTTStateProvider(config.name, config.description, dependencies.mqtt, config.topic)
  }

  async getValue (): Promise<string> {
    return this.state
  }
}
