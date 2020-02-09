using AutoMapper;

using DataAccumulator.BusinessLayer.Interfaces;
using DataAccumulator.BusinessLayer.Providers;
using DataAccumulator.BusinessLayer.Services;
using DataAccumulator.BusinessLayer.Validators;
using DataAccumulator.DataAccessLayer.Entities;
using DataAccumulator.DataAccessLayer.Interfaces;
using DataAccumulator.DataAccessLayer.Repositories;
using DataAccumulator.DataAggregator;
using DataAccumulator.DataAggregator.Interfaces;
using DataAccumulator.DataAggregator.Providers;
using DataAccumulator.DataAggregator.Services;
using DataAccumulator.Shared.Models;
using DataAccumulator.WebAPI.Extensions;
using DataAccumulator.WebAPI.TasksScheduler;
using DataAccumulator.WebAPI.TasksScheduler.Jobs;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Quartz.Spi;
using Serilog;
using Serilog.Events;
using ServiceBus.Shared.Interfaces;
using ServiceBus.Shared.Queue;
using System;

namespace DataAccumulator
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            Configuration = configuration;
            Env = env;
        }

        public IConfiguration Configuration { get; }
        public IWebHostEnvironment Env { get; }

        public bool UserAzureServiceBus { get; private set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder
                        .AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
            });

            services.AddTransient<IDataAccumulatorService<CollectedDataDto>, DataAccumulatorService>();
            services.AddTransient<IDataAggregatorService<CollectedDataDto>, DataAggregatorService>();
            services.AddTransient<IInstanceSettingsService<InstanceSettingsDto>, InstanceSettingsService>();

            services.AddTransient<IAggregatorService<CollectedDataDto>, AggregatorService>();
            services.AddTransient<IDataAggregatorCore<CollectedDataDto>, DataAggregatorCore>();

            services.AddTransient<IThresholdsValidatorCore<CollectedDataDto>, ThresholdsValidatorCore>();

            services.AddTransient<IMLProvider, LocalMLProvider>();
            services.AddTransient<IAnomalyDetector, AnomalyDetector>();

            services.AddTransient<ILogService, LogService>();

            services.AddTransient<IJobFactory, JobFactory>(provider => new JobFactory(provider));

            //services.AddTransient<CollectedDataAggregatingByFiveMinutesJob>();
            services.AddTransient<CollectedDataAggregatingByHourJob>();
            services.AddTransient<CollectedDataAggregatingByDayJob>();
            services.AddTransient<CollectedDataAggregatingByWeekJob>();
            services.AddTransient<CollectedDataAggregatingByMonthJob>();

            services.AddHealthChecks();
            services.AddRazorPages();

            ConfigureLogger();
            ConfigureDataStorage(services);
            ConfiguraAutomapper(services);
            ConfigureMessageQueue(services);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, ILoggerFactory loggerFactory)
        {
            if (Env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            loggerFactory.AddSerilog();

            app.UseHttpStatusCodeExceptionMiddleware();

            app.UseCors("CorsPolicy");

            app.UseRouting();

            app.UseQuartz(quartz =>
            {
                if (Configuration.GetSection("DataAggregator").GetValue<bool>("Aggregating"))
                {
                    //quartz.AddJob<CollectedDataAggregatingByFiveMinutesJob>("CollectedDataAggregatingByFiveMinutes", "DataAggregator", 5);
                    quartz.AddHourlyJob<CollectedDataAggregatingByHourJob>("CollectedDataAggregatingByHour", "DataAggregator");
                    quartz.AddDailyJob<CollectedDataAggregatingByDayJob>("CollectedDataAggregatingByDay", "DataAggregator");
                    quartz.AddWeeklyJob<CollectedDataAggregatingByWeekJob>("CollectedDataAggregatingByWeek", "DataAggregator");
                    quartz.AddMonthlyJob<CollectedDataAggregatingByMonthJob>("CollectedDataAggregatingByMonth", "DataAggregator");
                }
            });

            app.UseMessageQueue();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapDefaultControllerRoute();
                endpoints.MapHealthChecks("/health");
            });
        }

        public virtual void ConfigureDataStorage(IServiceCollection services)
        {
            var connectionString = Configuration.GetConnectionString(
                Env.IsProduction() ? "AzureCosmosDbConnection" : "MongoDbConnection");

            services.AddTransient<IDataAccumulatorRepository<CollectedData>, DataAccumulatorRepository>(
                _ => new DataAccumulatorRepository(connectionString, "watcher-data-storage", CollectedDataType.Accumulation));
            services.AddTransient<IDataAggregatorRepository<CollectedData>, DataAggregatorRepository>(
                _ => new DataAggregatorRepository(connectionString, "watcher-data-storage"));
            services.AddTransient<ILogRepository, LogRepository>(
                _ => new LogRepository(connectionString, "watcher-data-storage"));
            services.AddTransient<IInstanceSettingsRepository<InstanceSettings>, InstanceSettingsRepository>(
                _ => new InstanceSettingsRepository(connectionString, "watcher-data-storage"));
            services.AddTransient<IInstanceAnomalyReportsRepository, InstanceAnomalyReportsRepository>(
                _ => new InstanceAnomalyReportsRepository(connectionString, "watcher-data-storage"));
        }

        public virtual void ConfiguraAutomapper(IServiceCollection services)
        {
            var configuration = new MapperConfiguration(cfg =>
            {
                cfg.CreateMissingTypeMaps = true;
                cfg.ValidateInlineMaps = false;
                cfg.CreateMap<CollectedData, CollectedDataDto>();
                cfg.CreateMap<CollectedDataDto, CollectedData>();
                cfg.CreateMap<CollectedData, CollectedData>();
                cfg.CreateMap<ActionLogDto, ActionLog>();
                cfg.CreateMap<InstanceSettings, InstanceSettingsDto>();
                cfg.CreateMap<InstanceSettingsDto, InstanceSettings>();
                cfg.CreateMap<InstanceSettings, InstanceSettings>();
            });

            services.AddTransient(_ => configuration.CreateMapper());
        }

        public virtual void ConfigureMessageQueue(IServiceCollection services)
        {
            if (UserAzureServiceBus)
            {
                services.Configure<QueueOptions>(Configuration.GetSection("ServiceBus"));

                services.AddTransient<IAzureQueueSender, AzureQueueSender>();
                services.AddTransient<IAzureQueueReceiver, AzureQueueReceiver>();
                services.AddSingleton<IQueueProvider, ServiceBusProvider>();
            }
            else
            {
                services
                    .Configure<RabbitMqConnectionOptions>(Configuration.GetSection("RabbitMqConnection"))
                    .Configure<QueueOptions>(Configuration.GetSection("RabbitMqQueues"));

                services.AddTransient<IRabbitMqSender, RabbitMqSender>();
                services.AddTransient<IRabbitMqReceiver, RabbitMqReceiver>();
                services.AddSingleton<IQueueProvider, RabbitMqProvider>();
            }
        }

        public virtual void ConfigureLogger()
        {
            var outputTemplate = "[{Timestamp:HH:mm:ss} {Level}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}{properties}{NewLine}";

            if (Env.IsProduction())
            {
                var connectionString = Configuration.GetConnectionString("LogsConnection");
                var storageAccount = CloudStorageAccount.Parse(connectionString);
                Log.Logger = new LoggerConfiguration()
                    .ReadFrom.Configuration(Configuration)
                    .Enrich.FromLogContext()
                    .WriteTo.Console(outputTemplate: outputTemplate)
                    .WriteTo.AzureTableStorageWithProperties(storageAccount,
                        LogEventLevel.Warning,
                        storageTableName: "logs-table",
                        writeInBatches: true,
                        batchPostingLimit: 100,
                        period: new TimeSpan(0, 0, 3),
                        propertyColumns: new[] { "LogEventId", "ClassName", "Source" })
                    .CreateLogger();
            }
            else
            {
                Log.Logger = new LoggerConfiguration()
                    .ReadFrom.Configuration(Configuration)
                    .Enrich.FromLogContext()
                    .WriteTo.Console(outputTemplate: outputTemplate)
                    .CreateLogger();
            }
        }
    }
}
