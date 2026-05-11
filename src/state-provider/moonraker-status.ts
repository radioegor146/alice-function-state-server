import z from 'zod'

import { configValidator as baseConfigValidator, StateProvider, StateProviderConfig } from './types'

export interface MoonrakerStatusStateProviderConfig extends StateProviderConfig {
  baseUrl: string;
}

export const configValidator = z.intersection(z.object({
  baseUrl: z.string()
}), baseConfigValidator)

type BasePrinterInfo = {
  error: object
} | {
  result: {
    state: 'error' | 'ready' | 'shutdown' | 'starting';
  };
}

type PrintStatsAndVirtualSDCardStatus = {
  error: object
} | {
  result: {
    status: {
      print_stats: {
        filename: string;
        state: 'cancelled' | 'complete' | 'error' | 'paused' | 'printing' | 'standby';
      }
      virtual_sdcard: {
        progress: number;
      },
    }
  }
}

export class MoonrakerStatusStateProvider extends StateProvider {
  constructor (name: string, description: string,
    private readonly baseUrl: string) {
    super(name, description)
  }

  static create (config: MoonrakerStatusStateProviderConfig): MoonrakerStatusStateProvider {
    return new MoonrakerStatusStateProvider(config.name, config.description, config.baseUrl)
  }

  async getValue (): Promise<string> {
    let info: BasePrinterInfo

    try {
      info = await this.getBasePrinterInfo()
    } catch {
      return 'machine is unavailable'
    }

    if ('error' in info) {
      return 'machine is in error state'
    }

    switch (info.result.state) {
      case 'ready': {
        const status = await this.getPrintStatsAndVirtualSDCardStatus()
        if ('error' in status) {
          return 'machine is in error state'
        }
        switch (status.result.status.print_stats.state) {
          case 'cancelled': {
            return `machine is ready and last job '${
                            status.result.status.print_stats.filename}' was cancelled`
          }
          case 'complete': {
            return `machine is ready and last job '${
                            status.result.status.print_stats.filename}' was completed successfully`
          }
          case 'error': {
            return 'machine is ready but in error state'
          }
          case 'paused': {
            return `machine is on pause for job '${
                            status.result.status.print_stats.filename}'`
          }
          case 'printing': {
            return `machine is working and completed ${
                            Math.round(status.result.status.virtual_sdcard.progress * 100)}% of job '${
                            status.result.status.print_stats.filename}'`
          }
          case 'standby': {
            return 'machine is in standby'
          }
          default: {
            return 'machine is ready but in unknown state'
          }
        }
      }
      case 'error': {
        return 'machine is in error state'
      }
      case 'shutdown': {
        return 'machine is powered off'
      }
      case 'starting': {
        return 'machine starting'
      }
      default: {
        return 'machine is in unknown state'
      }
    }
  }

  private async getBasePrinterInfo (): Promise<BasePrinterInfo> {
    const response = await fetch(`${this.baseUrl}/printer/info`, {
      signal: AbortSignal.timeout(500)
    })
    return await response.json()
  }

  private async getPrintStatsAndVirtualSDCardStatus (): Promise<PrintStatsAndVirtualSDCardStatus> {
    const response = await fetch(`${this.baseUrl}/printer/objects/query`, {
      body: JSON.stringify({
        objects: {
          print_stats: null,
          virtual_sdcard: null
        }
      }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      signal: AbortSignal.timeout(500)
    })
    return await response.json()
  }
}
