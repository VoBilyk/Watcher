namespace ServiceBus.Shared.Interfaces
{
    using RabbitMQ.Client;
    using ServiceBus.Shared.Common;
    using ServiceBus.Shared.Messages;
    using System;
    using System.Threading.Tasks;

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
