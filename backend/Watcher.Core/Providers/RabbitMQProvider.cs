namespace Watcher.Core.Providers
{
    using System;
    using System.Threading.Tasks;
    using System.Collections.Generic;
    using System.Diagnostics;

    using Microsoft.AspNetCore.SignalR;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Logging;
    using Microsoft.Extensions.Options;

    using AutoMapper;

    using RabbitMQ.Client;

    using Watcher.Common.Dtos;
    using Watcher.Common.Enums;
    using Watcher.Common.Requests;
    using Watcher.Core.Interfaces;
    using Watcher.Core.Hubs;
    using Watcher.DataAccess.Interfaces;

    using DataAccumulator.DataAccessLayer.Entities;
    using DataAccumulator.DataAccessLayer.Interfaces;
    using DataAccumulator.Shared.Models;

    using ServiceBus.Shared.Common;
    using ServiceBus.Shared.Enums;
    using ServiceBus.Shared.Interfaces;
    using ServiceBus.Shared.Messages;
    using ServiceBus.Shared.Queue;

    public class RabbitMqProvider : IQueueProvider, IDisposable
    {
        private readonly ILogger<RabbitMqProvider> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHubContext<DashboardsHub> _dashboardsHubContext;

        private readonly IOptions<RabbitMqConnectionOptions> _connectionOptions;
        private readonly IOptions<QueueOptions> _queueOptions;

        private readonly IConnection _connection;
        private readonly IModel _channel;

        private readonly IRabbitMqSender _sender;
        private readonly IRabbitMqReceiver _receiver;

        public RabbitMqProvider(ILoggerFactory loggerFactory,
                                IServiceScopeFactory scopeFactory,
                                IHubContext<DashboardsHub> dashboardsHubContext,
                                IOptions<RabbitMqConnectionOptions> connectionOptions,
                                IOptions<QueueOptions> queueOptions,
                                IRabbitMqSender sender,
                                IRabbitMqReceiver receiver)
        {
            _logger = loggerFactory?.CreateLogger<RabbitMqProvider>() ?? throw new ArgumentNullException(nameof(loggerFactory));

            _connectionOptions = connectionOptions;
            _queueOptions = queueOptions;
            _dashboardsHubContext = dashboardsHubContext;
            _scopeFactory = scopeFactory;

            _sender = sender;
            _receiver = receiver;
            _connection = GetConnection();
            _channel = _connection.CreateModel();

            _channel.QueueDeclare(_queueOptions.Value.NotificationQueueName);
            _channel.QueueDeclare(_queueOptions.Value.DataQueueName);
            _channel.QueueDeclare(_queueOptions.Value.ErrorQueueName);
            _channel.QueueDeclare(_queueOptions.Value.AnomalyReportQueueName);
            _channel.QueueDeclare(_queueOptions.Value.SettingsQueueName);

            _receiver.Receive<InstanceCollectedDataMessage>(
                _channel,
                _queueOptions.Value.DataQueueName,
                OnProcessAsync,
                ExceptionWhileProcessingHandler,
                OnWait);

            _receiver.Receive<InstanceErrorMessage>(
                _channel,
                _queueOptions.Value.ErrorQueueName,
                OnErrorProcessAsync,
                ExceptionWhileProcessingHandler,
                OnWait);

            _receiver.Receive<InstanceNotificationMessage>(
                _channel,
                _queueOptions.Value.NotificationQueueName,
                OnNotifyProcessAsync,
                ExceptionWhileProcessingHandler,
                OnWait);

            _receiver.Receive<InstanceAnomalyReportMessage>(
                _channel,
                _queueOptions.Value.AnomalyReportQueueName,
                OnAnomalyReportProcessAsync,
                ExceptionWhileProcessingHandler,
                OnWait);
        }

        private async Task<MessageProcessResponse> OnAnomalyReportProcessAsync(InstanceAnomalyReportMessage arg)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                var reportsService = scope.ServiceProvider.GetRequiredService<IInstanceAnomalyReportsService>();
                var report = await reportsService.GetReportByIdAsync(arg.AnomalyReportId);
                var notificationRequest = new NotificationRequest
                {
                    CreatedAt = report.Date,
                    InstanceId = report.ClientId,
                    Type = NotificationType.Info
                };

                var htmlFileUrl = await notificationService.CreateAnomalyReportNotificationAsync(notificationRequest, report);

                if (!string.IsNullOrWhiteSpace(htmlFileUrl))
                {
                    await reportsService.UpdateReportAsync(report.Id, htmlFileUrl);
                    // return MessageProcessResponse.Abandon;
                }
            }

            _logger.LogInformation("Instance Notification Message was created.");

            return MessageProcessResponse.Complete;
        }

        public async Task SendInstanceSettingsAsync(InstanceSettingsMessage message)
        {
            _sender.Send(_channel, _queueOptions.Value.SettingsQueueName, message);
        }

        private async Task<MessageProcessResponse> OnErrorProcessAsync(InstanceErrorMessage arg)
        {
            await _dashboardsHubContext.Clients.Group(arg.InstanceId.ToString()).SendAsync("Send", arg.ErrorMessage);
            _logger.LogInformation("Error Message with to Dashboards hub clients was sent.");
            return MessageProcessResponse.Complete;
        }

        private async Task<MessageProcessResponse> OnNotifyProcessAsync(InstanceNotificationMessage arg)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                var notificationRequest = new NotificationRequest
                {
                    Text = arg.Text,
                    CreatedAt = arg.CreatedAt,
                    InstanceId = arg.InstanceId
                };

                switch (arg.Type)
                {
                    case InstanceNotifyType.Critical:
                        notificationRequest.Type = NotificationType.Error;
                        break;
                    case InstanceNotifyType.Error:
                        notificationRequest.Type = NotificationType.Warning;
                        break;
                    default:
                        notificationRequest.Type = NotificationType.Info;
                        break;
                }

                var result = await notificationService.CreateEntityAsync(notificationRequest);

                if (result == null)
                {
                    return MessageProcessResponse.Abandon;
                }
            }

            _logger.LogInformation("Instance Notification Message was created.");

            return MessageProcessResponse.Complete;
        }

        private async Task<MessageProcessResponse> OnProcessAsync(InstanceCollectedDataMessage arg)
        {
            CollectedDataDto collectedDataDto = null;
            InstanceCheckedDto instanceCheckedDto = null;
            using (var scope = _scopeFactory.CreateScope())
            {
                var repo = scope.ServiceProvider.GetRequiredService<IDataAccumulatorRepository<CollectedData>>();
                var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var mapper = scope.ServiceProvider.GetRequiredService<IMapper>();
                var data = await repo.GetEntityIdAsync(arg.CollectedDataId);

                if (data != null)
                {
                    var result = await uow.InstanceRepository.UpateLastCheckedAsync(arg.InstanceId, data.Time);
                    if (result != null)
                    {
                        await uow.SaveAsync();
                        instanceCheckedDto = new InstanceCheckedDto
                        {
                            InstanceGuidId = result.GuidId,
                            OrganizationId = result.OrganizationId,
                            StatusCheckedAt = result.StatusCheckedAt
                        };
                    }

                    collectedDataDto = mapper.Map<CollectedData, CollectedDataDto>(data);
                }
                else
                {
                    return MessageProcessResponse.Abandon; // No such entity
                }
            }

            var tasks = new List<Task>(2);
            if (collectedDataDto != null)
            {
                tasks.Add(_dashboardsHubContext.Clients.Group(collectedDataDto.ClientId.ToString()).SendAsync("InstanceDataTick", collectedDataDto));
                _logger.LogInformation("Information Message with instanceData to Dashboards hub clients was sent.");
            }

            if (instanceCheckedDto != null)
            {
                tasks.Add(_dashboardsHubContext.Clients.Group(instanceCheckedDto.OrganizationId.ToString()).SendAsync("InstanceStatusCheck", instanceCheckedDto));
                _logger.LogInformation("Information Message with instance check tome to Dashboards hub clients was sent.");
            }

            await Task.WhenAll(tasks);

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
