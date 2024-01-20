import { Logger } from '../../utils/logger'
import type { DynamoDBStreamEvent } from 'aws-lambda'
import { execute } from '../../usecases/ProcessScheduleEventUseCase'

export const handler = async (event: DynamoDBStreamEvent): Promise<string> => {
  Logger.info('Starting schedule event process.')

  const rejectedResults = await execute(event.Records)

  if (rejectedResults.length > 0) {
    Logger.error('Some records were rejected.', { rejectedResults })
    throw new Error(`${rejectedResults.length} records were rejected.`)
  }

  Logger.info('Finished trigger schedule event process.')
  return 'Finished'
}

export const main = handler
