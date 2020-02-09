namespace DataAccumulator.BusinessLayer.Providers
{
    using System;
    using System.Diagnostics;
    using System.Threading.Tasks;

    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;

    using RabbitMQ.Client;

    using ServiceBus.Shared.Common;
    using ServiceBus.Shared.Interfaces;
    using ServiceBus.Shared.Messages;
    using ServiceBus.Shared.Queue;

    using DataAccumulator.BusinessLayer.Interfaces;
    using DataAccumulator.Shared.Models;

    public class RabbitMqProvider : IQueueProvider, IDisposable
    {
        private readonly ILogger<RabbitMqProvider> _logger;
        private readonly IOptions<RabbitMqConnectionOptions> _connectionOptions;
        private readonly IOptions<QueueOptions> _queueOptions;
        private readonly IInstanceSettingsService<InstanceSettingsDto> _instanceSettingsService;

        private readonly IConnection _connection;
        private readonly IModel _channel;

        private readonly IRabbitMqSender _sender;
        private readonly IRabbitMqReceiver _receiver;

        public RabbitMqProvider(ILoggerFactory loggerFactory,
                                IOptions<RabbitMqConnectionOptions> connectionOptions,
                                IOptions<QueueOptions> queueOptions,
                                IRabbitMqSender sender,
                                IRabbitMqReceiver receiver,
                                IInstanceSettingsService<InstanceSettingsDto> instanceSettingsService)
        {
            _logger = loggerFactory?.CreateLogger<RabbitMqProvider>() ?? throw new ArgumentNullException(nameof(loggerFactory));

            _connectionOptions = connectionOptions;
            _queueOptions = queueOptions;
            _instanceSettingsService = instanceSettingsService;

            _sender = sender;
            _receiver = receiver;

            _connection = GetConnection();
            _channel = _connection.CreateModel();

            _channel.QueueDeclare(queue: _queueOptions.Value.NotificationQueueName, exclusive: false);
            _channel.QueueDeclare(queue: _queueOptions.Value.DataQueueName, exclusive: false);
            _channel.QueueDeclare(queue: _queueOptions.Value.ErrorQueueName, exclusive: false);
            _channel.QueueDeclare(queue: _queueOptions.Value.AnomalyReportQueueName, exclusive: false);
            _channel.QueueDeclare(queue: _queueOptions.Value.SettingsQueueName, exclusive: false);

            _receiver.Receive<InstanceSettingsMessage>(
                _channel,
                _queueOptions.Value.SettingsQueueName,
                OnSettingsProcessAsync,
                ExceptionWhileProcessingHandler,
                OnWait
                );
        }

        public Task SendNotificationMessage(InstanceNotificationMessage message)
        {
            _sender.Send(_channel, _queueOptions.Value.NotificationQueueName, message);
            return Task.CompletedTask;
        }

        public Task SendErrorMessage(InstanceErrorMessage message)
        {
            _logger.LogInformation($"Error message was of {message.InstanceId} instance was send to rabbitMq: {message.ErrorMessage}");
            _sender.Send(_channel, _queueOptions.Value.ErrorQueueName, message);
            return Task.CompletedTask;
        }

        public Task SendDataMessage(InstanceCollectedDataMessage message)
        {
            _sender.Send(_channel, _queueOptions.Value.DataQueueName, message);
            return Task.CompletedTask;
        }

        public Task SendAnomalyReportMessage(InstanceAnomalyReportMessage message)
        {
            _sender.Send(_channel, _queueOptions.Value.AnomalyReportQueueName, message);
            return Task.CompletedTask;
        }

        private async Task<MessageProcessResponse> OnSettingsProcessAsync(InstanceSettingsMessage arg)
        {
            var dto = new InstanceSettingsDto()
            {
                ClientId = arg.InstanceId,
                IsActive = arg.IsActive,

                AggregationForHour = arg.AggregationForHour,
                AggregationForDay = arg.AggregationForDay,
                AggregationForWeek = arg.AggregationForWeek,
                AggregationForMonth = arg.AggregationForMonth,

                CpuUsagePercentageMax = arg.CpuMaxPercent,
                RamUsagePercentageMax = arg.RamMaxPercent,
                LocalDiskUsagePercentageMax = arg.DiskMaxPercent,

                //validators are enabled by default
                //maybe in future we may add ability to change it
                CpuValidator = true,
                RamValidator = true,
                LocalDiskVallidator = true,
            };

            var x = await _instanceSettingsService.AddEntityAsync(dto);
            if (x == null) return MessageProcessResponse.Abandon;
            return MessageProcessResponse.Complete;
        }

        private void ExceptionWhileProcessingHandler(Exception ex)
        {
            _logger.LogError($"Message handler encountered an exception {ex.Message}.");
        }

        private void OnWait()
        {
            Debug.WriteLine("*******************WAITING***********************");
        }

        private IConnection GetConnection()
        {
            var factory = new ConnectionFactory()
            {
                HostName = _connectionOptions.Value.HostName,
                UserName = _connectionOptions.Value.UserName,
                Password = _connectionOptions.Value.Password,
                VirtualHost = _connectionOptions.Value.VirtualHost
            };

            return factory.CreateConnection();
        }

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    _channel.Close();
                    _connection.Close();
                }

                disposedValue = true;
            }
        }

        void IDisposable.Dispose()
        {
            Dispose(true);
        }
        #endregion
    }
}
