namespace ServiceBus.Shared.Queue
{
    using System;
    using System.Text;
    using System.Threading.Tasks;

    using Microsoft.Azure.ServiceBus;
    using Newtonsoft.Json;

    using RabbitMQ.Client;
    using RabbitMQ.Client.Events;

    using ServiceBus.Shared.Interfaces;
    using ServiceBus.Shared.Messages;
    using ServiceBus.Shared.Common;

    public class RabbitMqReceiver : IRabbitMqReceiver
    {
        public RabbitMqReceiver() { }

        public void Receive<T>(
            IModel channel,
            string queue,
            Func<T, Task<MessageProcessResponse>> onProcess,
            Action<Exception> onProcessingError,
            Action onWait)
            where T : InstanceMessage
        {
            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += async (model, ea) =>
            {
                try
                {
                    var data = Encoding.UTF8.GetString(ea.Body);
                    var item = JsonConvert.DeserializeObject<T>(data);

                    // Process message
                    var result = await onProcess(item);

                    // Wait for next message
                    onWait();
                }
                catch (Exception ex)
                {
                    onProcessingError(ex);
                }
            };

            channel.BasicConsume(
                queue: queue,
                autoAck: true,
                consumer: consumer);
        }
    }
}