import { type CronExpression, parseExpression } from 'cron-parser'
import { Logger } from '../../utils/logger'
import type { Schedule } from '../../domains/Schedule'

export const calculateNextExecutionTimestamp = (schedule: Schedule): string | null => {
  const cron = parseCronExpression(schedule)

  if (cron.hasNext()) {
    return toMinutePrecisionDateFormat(cron.next().toDate())
  }

  return null
}

function parseCronExpression(schedule: Schedule): CronExpression {
  const currentDate = new Date()
  let startDate = schedule.startDate ? new Date(schedule.startDate) : currentDate
  if (startDate.getTime() < currentDate.getTime()) {
    startDate = currentDate
  }

  try {
    return parseExpression(schedule.cron, {
      startDate,
      utc: !schedule.timezone,
      tz: schedule.timezone,
      endDate: schedule.endDate,
      currentDate: startDate,
    })
  } catch (error) {
    Logger.error('Invalid cron expression.', {
      schedule,
      error: { message: error.message },
    })
    throw new Error(`Invalid cron expression: ${error.message}.`)
  }
}

/**
 * Formats the date to the minute precision date format in ISO 8601 without decimal fraction (`yyyy-MM-ddTHH:mm:ssZ`).
 *
 * This format must be the exact the same as the received in StepFunction's input variables
 * when it's triggered by EventBridge Rule.
 *
 * @param baseDate the date to be formatted
 * @returns the date formatted to the minute precision date format in ISO 8601
 */
function toMinutePrecisionDateFormat(baseDate: Date): string {
  const date = new Date(baseDate)
  date.setSeconds(0)
  date.setMilliseconds(0)

  const year = date.getUTCFullYear()
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const day = date.getUTCDate().toString().padStart(2, '0')
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  const seconds = date.getUTCSeconds().toString().padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`
}
