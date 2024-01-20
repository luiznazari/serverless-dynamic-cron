import type { ScheduleModel } from '../models/ScheduleModel'
import type { ScheduledExecutionModel } from '../models/ScheduledExecutionModel'

export interface SchedulesRepository {
  getById: (id: string) => Promise<ScheduleModel | null>
}

export interface ScheduledExecutionsRepository {
  create: (scheduledExecution: ScheduledExecutionModel) => Promise<void>
  update: (scheduleId: string, nextExecution: string) => Promise<void>
  delete: (scheduleId: string) => Promise<void>
}
