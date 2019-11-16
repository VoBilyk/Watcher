using System;

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
using DataAccumulator.DataAggregator.Services;
using DataAccumulator.Shared.Models;
using DataAccumulator.WebAPI.Extensions;
using DataAccumulator.WebAPI.TasksScheduler;
using DataAccumulator.WebAPI.TasksScheduler.Jobs;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Quartz.Spi;
using ServiceBus.Shared.Interfaces;
using ServiceBus.Shared.Queue;

namespace DataAccumulator
{
    public class Startup
    {
        public Startup(IConfiguration configuration) => Configuration = configuration;

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
            });

            //var serviceBusSection = Configuration.GetSection("ServiceBus");

            //var azureMLSection = Configuration.GetSection("AzureML");
            //services.Configure<AzureMLOptions>(o =>
            //{
            //    o.ApiKey = azureMLSection["ApiKey"];
            //    o.Url = azureMLSection["Url"];
            //});

            services.AddTransient<IDataAccumulatorService<CollectedDataDto>, DataAccumulatorService>();
            services.AddTransient<IDataAggregatorService<CollectedDataDto>, DataAggregatorService>();
            services.AddTransient<IInstanceSettingsService<InstanceSettingsDto>, InstanceSettingsService>();

            services.AddTransient<IAggregatorService<CollectedDataDto>, AggregatorService>();
            services.AddTransient<IDataAggregatorCore<CollectedDataDto>, DataAggregatorCore>();

            services.AddTransient<IThresholdsValidatorCore<CollectedDataDto>, ThresholdsValidatorCore>();

            //services.AddTransient<IAzureMLProvider, AzureMLProvider>();
            //services.AddTransient<IAnomalyDetector, AnomalyDetector>();

            services.AddTransient<ILogService, LogService>();
            services.AddTransient<ILogRepository, LogRepository>();

            services.AddTransient<IJobFactory, JobFactory>(
                (provider) =>
                {
                    return new JobFactory(provider);
                });

            // repo initialization localhost while development env, azure in prod
            ConfigureDataStorage(services, Configuration);

            // services.AddTransient<CollectedDataAggregatingByFiveMinutesJob>();
            services.AddTransient<CollectedDataAggregatingByHourJob>();
            services.AddTransient<CollectedDataAggregatingByDayJob>();
            services.AddTransient<CollectedDataAggregatingByWeekJob>();
            services.AddTransient<CollectedDataAggregatingByMonthJob>();

            //services.AddTransient<IAzureQueueSender, AzureQueueSender>();
            //services.AddTransient<IAzureQueueReceiver, AzureQueueReceiver>();
            //services.AddSingleton<IServiceBusProvider, ServiceBusProvider>();

            services.AddTransient<IRabbitMqSender, RabbitMqSender>();
            services.AddTransient<IRabbitMqReceiver, RabbitMqReceiver>();
            services.AddSingleton<IQueueProvider, RabbitMqProvider>();

            var mapper = MapperConfiguration().CreateMapper();
            services.AddTransient(_ => mapper);

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            ConfigureRabbitMq(services, Configuration);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IApplicationLifetime lifetime)
        {
            app.UseDeveloperExceptionPage();
            app.UseDatabaseErrorPage();

            app.UseHttpStatusCodeExceptionMiddleware();

            app.UseCors("CorsPolicy");
            
            app.UseMvc();

            app.UseQuartz((quartz) =>
            {
                if (Configuration.GetSection("DataAggregator").GetValue<bool>("Aggregating"))
                {
                    // quartz.AddJob<CollectedDataAggregatingByFiveMinutesJob>("CollectedDataAggregatingByFiveMinutes", "DataAggregator", 5);
                    quartz.AddHourlyJob<CollectedDataAggregatingByHourJob>("CollectedDataAggregatingByHour", "DataAggregator");
                    quartz.AddDailyJob<CollectedDataAggregatingByDayJob>("CollectedDataAggregatingByDay", "DataAggregator");
                    quartz.AddWeeklyJob<CollectedDataAggregatingByWeekJob>("CollectedDataAggregatingByWeek", "DataAggregator");
                    quartz.AddMonthlyJob<CollectedDataAggregatingByMonthJob>("CollectedDataAggregatingByMonth", "DataAggregator");
                }
            });

            app.UseRabbitListener();
        }
        public virtual void ConfigureDataStorage(IServiceCollection services, IConfiguration configuration)
        {
            var enviroment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            var connectionString = Configuration.GetConnectionString(enviroment == EnvironmentName.Production ? "AzureCosmosDbConnection" : "MongoDbConnection");

            services.AddTransient<IDataAccumulatorRepository<CollectedData>, DataAccumulatorRepository>(
                options => new DataAccumulatorRepository(connectionString, "watcher-data-storage", CollectedDataType.Accumulation));
            services.AddTransient<IDataAggregatorRepository<CollectedData>, DataAggregatorRepository>(
                options => new DataAggregatorRepository(connectionString, "watcher-data-storage"));
            services.AddTransient<ILogRepository, LogRepository>(
                options => new LogRepository(connectionString, "watcher-data-storage"));
            services.AddTransient<IInstanceSettingsRepository<InstanceSettings>, InstanceSettingsRepository>(
              options => new InstanceSettingsRepository(connectionString, "watcher-data-storage"));
            services.AddTransient<IInstanceAnomalyReportsRepository, InstanceAnomalyReportsRepository>(
                options => new InstanceAnomalyReportsRepository(connectionString, "watcher-data-storage"));
        }

        public MapperConfiguration MapperConfiguration()
        {
            return new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<CollectedData, CollectedDataDto>();
                cfg.CreateMap<CollectedDataDto, CollectedData>();
                cfg.CreateMap<CollectedData, CollectedData>();
                cfg.CreateMap<ActionLogDto, ActionLog>();
                cfg.CreateMap<InstanceSettings, InstanceSettingsDto>();
                cfg.CreateMap<InstanceSettingsDto, InstanceSettings>();
                cfg.CreateMap<InstanceSettings, InstanceSettings>();
            });
        }

        public void ConfigureRabbitMq(IServiceCollection services, IConfiguration configuration)
        {
            var rabbitMqConnection = Configuration.GetSection("RabbitMqConnection");
            var rabbitMqQueues = Configuration.GetSection("RabbitMqQueues");

            services
                .Configure<RabbitMqConnectionOptions>(rabbitMqConnection)
                .Configure<QueueOptions>(rabbitMqQueues);
        }
    }
}
