namespace Watcher.Core.Interfaces
{
    using ServiceBus.Shared.Messages;

    public interface IRabbitMqProvider
    {
        void SendNotification(InstanceNotificationMessage arg);

        void OnReceiveNotification(InstanceNotificationMessage arg);
    }
}
