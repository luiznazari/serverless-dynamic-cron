import type { DynamoDBRecord } from 'aws-lambda'
import { Logger } from '../utils/logger'
import type { Schedule } from '../domains/Schedule'
import type { RejectedRecord } from '../dto/RejectedRecord'
import type { ScheduledExecutionModel } from '../models/ScheduledExecutionModel'
import { type ScheduleDynamoModel, mapDynamoToModel } from '../models/ScheduleModel'
import { calculateNextExecutionTimestamp } from './services/ScheduledExecutionService'
import { scheduledExecutionsRepository } from '../repositories'

export const execute = async (records: DynamoDBRecord[]): Promise<RejectedRecord[]> => {
  const rejectedRecords: RejectedRecord[] = []

  await Promise.allSettled(
    records.map(record =>
      processRecord(record).catch(cause => {
        if (!cause.expected) {
          Logger.error('Unexpected error processing record.', {
            eventID: record.eventID,
            eventName: record.eventName,
            cause: {
              message: cause.message,
              stack: cause.stack,
            },
          })
        }

        rejectedRecords.push({
          eventID: record.eventID ?? '',
          eventName: record.eventName ?? '',
          cause: {
            message: cause.message,
          },
        })
      }),
    ),
  )

  return rejectedRecords
}

function processRecord(record: DynamoDBRecord): Promise<void> {
  if (!record.eventName) {
    throw new Error('No event name!')
  }

  const eventNameHandlers: Record<string, (record: DynamoDBRecord) => Promise<void>> = {
    INSERT: handleInsert,
    REMOVE: handleRemove,
    MODIFY: handleModify,
  }

  Logger.info(`Processing ${record.eventName} record.`)

  return eventNameHandlers[record.eventName](record)
}

async function handleInsert(record: DynamoDBRecord): Promise<void> {
  const schedule = getNewImage(record)
  Logger.info('Handling insert.', { id: schedule.id })

  if (!schedule.cron) {
    Logger.info('No cron expression to schedule.')
    return
  }

  const nextExecution = calculateNextExecutionTimestamp(schedule)

  if (!nextExecution) {
    Logger.info('No next execution.', { newImage: schedule })
    await scheduledExecutionsRepository.delete(schedule.id)
    return
  }

  const scheduledExecution = createScheduledExecution(schedule.id, nextExecution)
  Logger.info('Creating scheduled execution', scheduledExecution)
  await scheduledExecutionsRepository.create(scheduledExecution)
}

async function handleModify(record: DynamoDBRecord): Promise<void> {
  const schedule = getNewImage(record)
  Logger.info('Handling modify.', { id: schedule.id })

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

function createScheduledExecution(
  scheduleId: string,
  nextExecution: string,
): ScheduledExecutionModel {
  return {
    scheduleId,
    nextExecution,
    type: 'scheduled',
  }
}

async function handleRemove(record: DynamoDBRecord): Promise<void> {
  const schedule = getOldImage(record)
  Logger.info('Handling remove.', { id: schedule.id })
  await this.scheduledExecutionsRepository.delete(schedule.id)
}

function getNewImage(record: DynamoDBRecord): Schedule {
  return getImage(record.dynamodb?.NewImage as ScheduleDynamoModel)
}

function getOldImage(record: DynamoDBRecord): Schedule {
  return getImage(record.dynamodb?.OldImage as ScheduleDynamoModel)
}

function getImage(image: ScheduleDynamoModel): Schedule {
  if (!image) {
    throw new Error('No DynamoDB image!')
  }

  return mapDynamoToModel(image)
}
