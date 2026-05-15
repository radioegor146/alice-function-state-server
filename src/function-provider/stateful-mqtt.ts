import { MqttClient } from 'mqtt'
import z from 'zod'

import { getLogger } from '../logger'
import {
  configValidator as baseConfigValidator,
  FunctionArgument,
  FunctionProvider,
  FunctionProviderConfig
} from './types'

export interface StatefulMQTTFunctionProviderConfig extends FunctionProviderConfig {
  stateArgument: FunctionArgument;
  topic: string;
}

export interface StatefulMQTTFunctionProviderDependencies {
  mqtt: MqttClient;
}

export const configValidator = z.intersection(z.object({
  stateArgument: z.object({
    constraints: z.discriminatedUnion('type', [
      z.object({
        argumentType: z.literal('number'),
        max: z.number(),
        min: z.number(),
        type: z.literal('number-min-max')
      }),
      z.object({
        argumentType: z.literal('number'),
        type: z.literal('number-variants'),
        variants: z.array(z.object({
          description: z.string(),
          value: z.number()
        }))
      }),
      z.object({
        argumentType: z.literal('string'),
        type: z.literal('string-not-empty')
      })
    ]),
    description: z.string()
  }),
  topic: z.string()
}), baseConfigValidator)

export class StatefulMQTTFunctionProvider extends FunctionProvider {
  private readonly logger = getLogger<StatefulMQTTFunctionProvider>()

  constructor (name: string, description: string,
    stateArgument: FunctionArgument,
    private readonly mqtt: MqttClient,
    private readonly topic: string) {
    super(name, description, {
      state: stateArgument
    })
  }

  static create (config: StatefulMQTTFunctionProviderConfig,
    dependencies: StatefulMQTTFunctionProviderDependencies): StatefulMQTTFunctionProvider {
    return new StatefulMQTTFunctionProvider(config.name, config.description,
      config.stateArgument, dependencies.mqtt, config.topic)
  }

  async invoke (argumentValues: Record<string, number | string>): Promise<void> {
    if (argumentValues['state'] === undefined) {
      this.logger.warn(`Called '${this.getName()}' but without state`)
      return
    }
    const value = argumentValues['state'].toString()
    await this.mqtt.publishAsync(this.topic, value)
    this.logger.info(`Sent to '${this.topic}' '${value}'`)
  }
}
