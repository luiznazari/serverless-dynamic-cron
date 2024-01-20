/**
 * Checks if a specific environment variable is defined.
 *
 * @param env The name of the environment variable.
 * @returns true if the variable exists, false otherwise.
 */
export const isEnvDefined = (env: string): boolean => {
  const envValue = process.env[env]
  return envValue !== undefined && envValue !== null
}

const get = (env: string, defaultValue?: unknown): string => {
  if (!isEnvDefined(env)) {
    const hasDefaultValue = defaultValue !== undefined && defaultValue !== null
    if (hasDefaultValue) {
      return defaultValue as string
    }

    throw new Error(
      `The environment variable "${env}" is required and was not set. If it's an optional env, please, add a default value when getting the variable.`,
    )
  }

  return process.env[env] as string
}

/**
 * Retrieves and returns the value of an environment variable.
 *
 * @param env The name of the environment variable.
 * @param defaultValue [Optional] Default value if the variable does not exist.
 * 'undefined' and 'null' are not accepted as valid default values.
 * @throws InvalidEnvironmentException - if the environment variable does not exist
 * and no valid default value has been provided.
 * @returns The value of the variable or the default value.
 */
export const getEnv = (env: string, defaultValue?: string): string =>
  get(env, defaultValue)
