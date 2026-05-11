import { getLogger } from './logger'

interface NamedObject {
  getName(): string;
}

const logger = getLogger()

export function add<T extends NamedObject> (collection: Record<string, T>, object: T) {
  if (collection[object.getName()] !== undefined) {
    logger.warn(`Tried to add already existing '${object.getName()}' item to collection`)
    return
  }
  collection[object.getName()] = object
}
