﻿namespace DataAccumulator.BusinessLayer.Providers
{
    using System;
    using System.Diagnostics;
    using System.Threading;
    using System.Threading.Tasks;

    using DataAccumulator.BusinessLayer.Interfaces;
    using DataAccumulator.Shared.Models;

    using Microsoft.Azure.ServiceBus;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;

    using ServiceBus.Shared.Common;
    using ServiceBus.Shared.Messages;
    using ServiceBus.Shared.Queue;

    public class ServiceBusProvider : IServiceBusProvider, IDisposable
    {
        private readonly ILogger<ServiceBusProvider> _logger;
        private readonly IInstanceSettingsService<InstanceSettingsDto> _instanceSettingsService;
        private readonly IOptions<QueueSettings> _queueOptions;
        private readonly IAzureQueueSender _azureQueueSender;
        private readonly IAzureQueueReceiver _azureQueueReceiver;

        private readonly QueueClient _instanceDataQueueClient;
        private readonly QueueClient _instanceErrorQueueClient;
        private readonly QueueClient _instanceSettingsQueueClient;
        private readonly QueueClient _instanceNotifyQueueClient;
        private readonly QueueClient _instanceAnomalyReportQueueClient;

        public ServiceBusProvider(ILoggerFactory loggerFactory,
                                  IInstanceSettingsService<InstanceSettingsDto> instanceSettingsService,
                                  IOptions<QueueSettings> queueOptions,
                                  IAzureQueueSender azureQueueSender,
                                  IAzureQueueReceiver azureQueueReceiver)
        {
            _logger = loggerFactory?.CreateLogger<ServiceBusProvider>() ?? throw new ArgumentNullException(nameof(loggerFactory));
            _instanceSettingsService = instanceSettingsService;
            _azureQueueSender = azureQueueSender;
            _azureQueueReceiver = azureQueueReceiver;
            _queueOptions = queueOptions;
            _instanceDataQueueClient = new QueueClient(_queueOptions.Value.ConnectionString, _queueOptions.Value.DataQueueName);
            _instanceErrorQueueClient = new QueueClient(_queueOptions.Value.ConnectionString, _queueOptions.Value.ErrorQueueName);
            _instanceSettingsQueueClient = new QueueClient(_queueOptions.Value.ConnectionString, _queueOptions.Value.SettingsQueueName);
            _instanceNotifyQueueClient = new QueueClient(_queueOptions.Value.ConnectionString, _queueOptions.Value.NotificationQueueName);
            _instanceAnomalyReportQueueClient = new QueueClient(_queueOptions.Value.ConnectionString, _queueOptions.Value.AnomalyReportQueueName);

            _azureQueueReceiver.Receive<InstanceSettingsMessage>(
               _instanceSettingsQueueClient,
               onSettingsProcessAsync,
               ExceptionReceivedHandler,
               ExceptionWhileProcessingHandler,
               OnWait);

        }

        public Task SendDataMessage(InstanceCollectedDataMessage message)
        {
            return _azureQueueSender.SendAsync(_instanceDataQueueClient, message);
        }

        public Task SendDataMessage(Guid instanceId, Guid dataId)
        {
            var message = new InstanceCollectedDataMessage { InstanceId = instanceId, CollectedDataId = dataId };
            return _azureQueueSender.SendAsync(_instanceDataQueueClient, message);
        }

        public Task SendErrorMessage(InstanceErrorMessage message)
        {
            _logger.LogInformation($"Error message was of {message.InstanceId} instance was send to service bus: {message.ErrorMessage}");
            return _azureQueueSender.SendAsync(_instanceErrorQueueClient, message);
        }

        public Task SendErrorMessage(Guid instanceId, string errorMessage)
        {
            _logger.LogInformation($"Error message was of {instanceId} instance was send to service bus: {errorMessage}");
            var message = new InstanceErrorMessage { InstanceId = instanceId, ErrorMessage = errorMessage };
            return _azureQueueSender.SendAsync(_instanceErrorQueueClient, message);
        }

        public Task SendNotificationMessage(InstanceNotificationMessage message)
        {
            return _azureQueueSender.SendAsync(_instanceNotifyQueueClient, message);
        }

        public Task SendAnomalyReportMessage(InstanceAnomalyReportMessage message)
        {
            return _azureQueueSender.SendAsync(_instanceAnomalyReportQueueClient, message);
        }

        private void ExceptionReceivedHandler(ExceptionReceivedEventArgs exceptionReceivedEventArgs)
        {
            _logger.LogError($"Message handler encountered an exception {exceptionReceivedEventArgs.Exception}.");
            var context = exceptionReceivedEventArgs.ExceptionReceivedContext;
            _logger.LogError("Exception context for troubleshooting:");
            _logger.LogError($"- Endpoint: {context.Endpoint}");
            _logger.LogError($"- Entity Path: {context.EntityPath}");
            _logger.LogError($"- Executing Action: {context.Action}");
        }

        private void ExceptionWhileProcessingHandler(Exception ex)
        {
            _logger.LogError($"Message handler encountered an exception {ex.Message}.");
        }

        private void OnWait()
        {
            Debug.WriteLine("*******************WAITING***********************");
        }

        private async Task<MessageProcessResponse> onSettingsProcessAsync(InstanceSettingsMessage arg, CancellationToken stoppingToken)
        {
            if (stoppingToken.IsCancellationRequested)
            { 
                return MessageProcessResponse.Abandon;
            }

            InstanceSettingsDto dto = new InstanceSettingsDto()
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

        #region Disposable Support

        // To detect redundant calls
        private bool disposedValue;

        public async Task CloseClient()
        {
            if (!disposedValue)
            {
                await _instanceDataQueueClient.CloseAsync();
                await _instanceErrorQueueClient.CloseAsync();
                await _instanceSettingsQueueClient.CloseAsync();
                await _instanceNotifyQueueClient.CloseAsync();

                disposedValue = true;
            }
        }

        public void Dispose()
        {
            CloseClient().GetAwaiter().GetResult();
        }

        #endregion
    }
}
