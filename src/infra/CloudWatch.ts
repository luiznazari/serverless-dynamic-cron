const getResources = () => ({
  LogGroupProcessScheduledEvent: {
    Type: 'AWS::Logs::LogGroup',
    Properties: {
      LogGroupName: '${self:service}-${self:provider.stage}-process-scheduled-event',
    },
  },
})

export const CloudWatch = {
  getResources,
}
