namespace ServiceBus.Shared.Queue
{
    using System.Text;
    using Newtonsoft.Json;
    using RabbitMQ.Client;

    using ServiceBus.Shared.Interfaces;
    using ServiceBus.Shared.Messages;

    public class RabbitMqSender : IRabbitMqSender
    {
        public void Send<T>(IModel channel, string queue, T message) where T : InstanceMessage
        {
            var json = JsonConvert.SerializeObject(message);
            var body = Encoding.UTF8.GetBytes(json);

            channel.BasicPublish(
                exchange: "",
                routingKey: queue,
                basicProperties: null,
                body: body);
        }
    }
}
