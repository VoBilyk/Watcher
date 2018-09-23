namespace ServiceBus.Shared.Queue
{
    public class QueueSettings
    {
        public QueueSettings() { }

        public QueueSettings(string connectionString, 
                             string dataQueueName, 
                             string errorQueueName,
                             string settingsQueueName, 
                             string notificationQueueName, 
                             string anomalyReportQueueName)
        {
            ConnectionString = connectionString;
            DataQueueName = dataQueueName;
            ErrorQueueName = errorQueueName;
            SettingsQueueName = settingsQueueName;
            NotificationQueueName = notificationQueueName;
            AnomalyReportQueueName = anomalyReportQueueName;
        }

        public string ConnectionString { get; set; }

        public string DataQueueName { get; set; }

        public string ErrorQueueName { get; set; }

        public string SettingsQueueName { get; set; }

        public string NotificationQueueName { get; set; }

        public string AnomalyReportQueueName { get; set; }
    }
}
