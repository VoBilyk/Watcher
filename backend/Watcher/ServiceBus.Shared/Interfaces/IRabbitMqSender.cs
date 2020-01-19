namespace ServiceBus.Shared.Interfaces
{
    using RabbitMQ.Client;

    using ServiceBus.Shared.Messages;

    public interface IRabbitMqSender
    {
        void Send<T>(IModel channel, string queue, T message) where T : InstanceMessage;
    }
}
