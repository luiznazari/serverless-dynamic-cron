import { Logger } from '../../utils/logger'
import { execute } from '../../usecases/RescheduleEventUseCase'

type RescheduleEvent = {
  id: string
}

export const handler = async (event: RescheduleEvent): Promise<string> => {
  Logger.info('Starting schedule event process.')

  await execute(event.id)

  return 'Finished'
}

export const main = handler
