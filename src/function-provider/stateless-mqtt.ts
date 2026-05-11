import { MqttClient } from 'mqtt'
import z from 'zod'

import { getLogger } from '../logger'
import { configValidator as baseConfigValidator, FunctionProvider, FunctionProviderConfig } from './types'

export interface StatelessMQTTFunctionProviderConfig extends FunctionProviderConfig {
  topic: string;
  value: string;
}

export interface StatelessMQTTFunctionProviderDependencies {
  mqtt: MqttClient;
}

export const configValidator = z.intersection(z.object({
  topic: z.string(),
  value: z.string()
}), baseConfigValidator)

export class StatelessMQTTFunctionProvider extends FunctionProvider {
  private readonly logger = getLogger<StatelessMQTTFunctionProvider>()

  constructor (name: string, description: string,
    private readonly mqtt: MqttClient,
    private readonly topic: string,
    private readonly value: string) {
    super(name, description, {})
  }

  static create (config: StatelessMQTTFunctionProviderConfig,
    dependencies: StatelessMQTTFunctionProviderDependencies): StatelessMQTTFunctionProvider {
    return new StatelessMQTTFunctionProvider(config.name, config.description, dependencies.mqtt,
      config.topic, config.value)
  }

  async invoke (): Promise<void> {
    await this.mqtt.publishAsync(this.topic, this.value)
    this.logger.info(`Sent to '${this.topic}' '${this.value}'`)
  }
}
