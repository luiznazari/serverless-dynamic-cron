import { Logger } from '../utils/logger'
import type { Schedule } from '../domains/Schedule'
import { schedulesRepository } from '../repositories/impl/DynamoDBSchedulesRepository'
import { scheduledExecutionsRepository } from '../repositories'
import { calculateNextExecutionTimestamp } from './services/ScheduledExecutionService'

export const execute = async (id: string): Promise<void> => {
  const schedule = await schedulesRepository.getById(id)

  if (!schedule) {
    Logger.info('No schedule found.', { id })
    return scheduledExecutionsRepository.delete(id)
  }

  return reschedule(schedule)
}

async function reschedule(schedule: Schedule): Promise<void> {
  Logger.info('Rescheduling.', { id: schedule.id })

  if (!schedule.cron) {
    Logger.info('No cron expression to schedule.')
    return scheduledExecutionsRepository.delete(schedule.id)
  }

  const nextExecution = calculateNextExecutionTimestamp(schedule)

  if (!nextExecution) {
    Logger.info('No next execution.', { newImage: schedule })
    return scheduledExecutionsRepository.delete(schedule.id)
  }

  Logger.info('Updating scheduled execution', { id: schedule.id, nextExecution })
  await scheduledExecutionsRepository.update(schedule.id, nextExecution)
}
