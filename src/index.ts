<<<<<<< before updating
export type {
  ConfigOptions,
  ErrorHandlingOptions,
  OpenTelemetryOptions,
  TailwindOptions,
  TypeScriptOptions,
} from '#config.js'
||||||| last update
=======
import { err, ok, type Result } from 'neverthrow'
>>>>>>> after updating
<<<<<<< before updating
export { config } from '#config.js'
||||||| last update
export const greet = (name: string): string => {
  return `Hello, ${name}!`
}
=======
export const greet = (name: string): Result<string, Error> => {
  if (!name) return err(new Error('name must not be empty'))
  return ok(`Hello, ${name}!`)
}
>>>>>>> after updating
