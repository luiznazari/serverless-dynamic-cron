export type Schedule = {
  id: string
  cron: string
  timezone?: string
  startDate?: Date
  endDate?: Date
}
