import z from 'zod'

export interface FunctionArgument {
  constraints: FunctionArgumentValueConstraints;
  description: string;
}

export type FunctionArgumentValueConstraints =
    FunctionArgumentValueMinMaxConstraints
    | FunctionArgumentValueVariantsConstraints

export interface FunctionArgumentValueMinMaxConstraints {
  argumentType: 'number';
  max: number;
  min: number;
  type: 'number-min-max';
}

export interface FunctionArgumentValueVariantsConstraints {
  argumentType: 'number';
  type: 'number-variants';
  variants: {
    description: string;
    value: number;
  }[];
}

export interface FunctionProviderConfig {
  description: string;
  name: string;
}

export const configValidator = z.object({
  description: z.string()
})

export abstract class FunctionProvider {
  protected constructor (private readonly name: string, private readonly description: string,
    private readonly functionArguments: Record<string, FunctionArgument>) {}

  getArguments (): Record<string, FunctionArgument> {
    return this.functionArguments
  }

  getDescription (): string {
    return this.description
  }

  getName (): string {
    return this.name
  }

  abstract invoke (argumentValues: Record<string, number | string>): Promise<void>
}
