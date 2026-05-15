import { getLogger } from '../logger'
import { FunctionProvider } from './types'

export class LoggingDummyFunctionProvider extends FunctionProvider {
  private readonly logger = getLogger<LoggingDummyFunctionProvider>()

  async invoke (argumentValues: Record<string, number | string>): Promise<void> {
    this.logger.info(`function '${this.getName()}' was called with ${JSON.stringify(argumentValues)}`)
  }
}
