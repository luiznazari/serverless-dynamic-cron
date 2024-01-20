import type { DynamoModel } from './DynamoModel'

export interface ScheduleModel {
  id: string

  cron: string

  timezone?: string

  startDate?: Date

  endDate?: Date
}

export interface ScheduleDynamoModel extends DynamoModel {
  id: { S: string }

  cron: { S: string }

  timezone?: { S: string }

  startDate?: { S: string }

  endDate?: { S: string }
}

export const mapDynamoToModel = (model: ScheduleDynamoModel): ScheduleModel => {
  return {
    id: model.id.S,
    cron: model.cron.S,
    ...(model.timezone ? { timezone: model.timezone.S } : {}),
    ...(model.startDate ? { startDate: new Date(model.startDate.S) } : {}),
    ...(model.endDate ? { endDate: new Date(model.endDate.S) } : {}),
  }
}
