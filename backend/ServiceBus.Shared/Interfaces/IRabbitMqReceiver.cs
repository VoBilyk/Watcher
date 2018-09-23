namespace ServiceBus.Shared.Interfaces
{
    using System;
    using System.Threading.Tasks;

    using RabbitMQ.Client;

    using ServiceBus.Shared.Messages;
    using ServiceBus.Shared.Common;

    public interface IRabbitMqReceiver
    {
        void Receive<T>(
            IModel channel,
            string queue,
            Func<T, Task<MessageProcessResponse>> onProcess,
            Action<Exception> onProcessingError,
            Action onWait)
            where T : InstanceMessage;
    }
}
