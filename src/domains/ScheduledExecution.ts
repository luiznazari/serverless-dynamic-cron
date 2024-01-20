export enum ScheduledExecutionType {
  SCHEDULED = 'scheduled',
}

export interface ScheduledExecution {
  scheduleId: string

  type: ScheduledExecutionType

  nextExecution: number
}
