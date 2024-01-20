export type RejectedRecord = {
  eventID: string
  eventName: string
  cause: {
    message: string
  }
}
