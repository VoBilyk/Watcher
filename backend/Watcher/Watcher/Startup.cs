using AutoMapper;
using DataAccumulator.DataAccessLayer.Entities;
using DataAccumulator.DataAccessLayer.Interfaces;
using DataAccumulator.DataAccessLayer.Repositories;
using DataAccumulator.Shared.Models;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.WindowsAzure.Storage;
using Newtonsoft.Json;
using Serilog;
using Serilog.Events;
using ServiceBus.Shared.Interfaces;
using ServiceBus.Shared.Queue;
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using Watcher.Common.Options;
using Watcher.Common.Validators;
using Watcher.Core.Hubs;
using Watcher.Core.Interfaces;
using Watcher.Core.MappingProfiles;
using Watcher.Core.Providers;
using Watcher.Core.Services;
using Watcher.DataAccess;
using Watcher.DataAccess.Data;
using Watcher.DataAccess.Interfaces;
using Watcher.Extensions;
using Watcher.Utils;

namespace Watcher
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


        public string ImagesPath => Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(o => o.AddPolicy("CorsPolicy", builder =>
                builder
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .WithOrigins(Configuration.GetValue<string[]>("AllowedOrigin"))
                ));

            services.Configure<TimeServiceConfiguration>(Configuration.GetSection("TimeService"));

            services.Configure<WatcherTokenOptions>(Configuration.GetSection("Security"));

            services.ConfigureSwagger(Configuration);

            services.AddScoped<IUnitOfWork, UnitOfWork>();

            services.AddTransient<IUsersService, UsersService>();
            services.AddTransient<ITokensService, TokensService>();
            services.AddTransient<IDashboardsService, DashboardsService>();
            services.AddTransient<IOrganizationService, OrganizationService>();
            services.AddTransient<IChatsService, ChatsService>();
            services.AddTransient<IMessagesService, MessagesService>();
            services.AddTransient<INotificationService, NotificationService>();
            services.AddTransient<INotificationSettingsService, NotificationSettingsService>();
            services.AddTransient<IEmailProvider, EmailProvider>();
            services.AddTransient<IInstanceService, InstanceService>();
            services.AddTransient<IFeedbackService, FeedbackService>();
            services.AddTransient<IChartsService, ChartsService>();
            services.AddTransient<IResponseService, ResponseService>();
            services.AddTransient<IOrganizationInvitesService, OrganizationInvitesService>();
            services.AddTransient<ICollectedDataService, CollectedDataService>();
            services.AddTransient<IRoleService, RoleService>();
            services.AddTransient<IOrganizationRoleService, OrganizationRoleService>();
            services.AddTransient<IUserOrganizationService, UserOrganizationService>();
            services.AddTransient<IAggregateDataService, AggregatedDataService>();
            services.AddTransient<IInstanceAnomalyReportsService, InstanceAnomalyReportsService>();
            services.AddTransient<ICollectorActionLogService, CollectorActionLogService>();
            services.AddTransient<IThemeService, ThemeService>();
            services.AddTransient<ICollectorAppsService, CollectorAppsService>();
            services.AddTransient<IRabbitMqSender, RabbitMqSender>();
            services.AddTransient<IRabbitMqReceiver, RabbitMqReceiver>();
            services.AddSingleton<IQueueProvider, RabbitMqProvider>();

            ConfigureLogger();

            ConfigureRabbitMq(services);

            // It's Singleton so we can't consume Scoped services & Transient services that consume Scoped services
            // services.AddHostedService<WatcherService>();

            ConfigureDataStorage(services);
            ConfigureFileStorage(services);

            Directory.CreateDirectory(ImagesPath);
            services.AddSingleton<IFileProvider>(_ => new PhysicalFileProvider(ImagesPath));
            services.Configure<FormOptions>(options =>
            {
                options.MemoryBufferThreshold = 1024 * 1024 * 100;
            });

            ConfigureDatabase(services);

            ConfigureAutomapper(services);

            ConfigureAuth(services);

            var addSignalRBuilder = services
                .AddSignalR(o => o.EnableDetailedErrors = true)
                .AddNewtonsoftJsonProtocol(o => o.PayloadSerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore);

            if (Env.IsProduction())
            {
                addSignalRBuilder.AddAzureSignalR(Configuration.GetConnectionString("AzureSignalRConnection"));
            }

            services.AddHealthChecks();

            services.AddMvcCore()
                .AddApiExplorer();

            services.AddRazorPages()
                .AddNewtonsoftJson(MvcSetup.JsonSetupAction)
                .AddFluentValidation(fv =>
                    {
                        fv.ImplicitlyValidateChildProperties = true;
                        // fv.RunDefaultMvcValidationAfterFluentValidationExecutes = false;
                        fv.RegisterValidatorsFromAssemblyContaining<OrganizationValidator>();
                    });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app)
        {
            if (Env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseHttpStatusCodeExceptionMiddleware();

            app.UseRouting();

            UpdateDatabase(app);

            app.UseConfiguredSwagger();
            app.UseHttpsRedirection();

            app.UseDefaultFiles();

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(ImagesPath)
            });
            app.UseFileServer();

            app.UseCors("CorsPolicy");

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseWatcherAuth();

            app.UseRabbitListener();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapDefaultControllerRoute();
                endpoints.MapHealthChecks("/health");
                endpoints.MapHub<NotificationsHub>("/notifications");
                endpoints.MapHub<DashboardsHub>("/dashboards");
                endpoints.MapHub<InvitesHub>("/invites");
                endpoints.MapHub<ChatsHub>("/chatsHub");
            });
        }

        public virtual void ConfigureRabbitMq(IServiceCollection services) =>
            services
                .Configure<RabbitMqConnectionOptions>(Configuration.GetSection("RabbitMqConnection"))
                .Configure<QueueOptions>(Configuration.GetSection("RabbitMqQueues"));

        public virtual void ConfigureDataStorage(IServiceCollection services)
        {
            string connectionString = Configuration.GetConnectionString(
                Env.IsProduction() ? "AzureCosmosDbConnection" : "MongoDbConnection");

            services.AddScoped<IDataAccumulatorRepository<CollectedData>, DataAccumulatorRepository>(
                options => new DataAccumulatorRepository(connectionString, "watcher-data-storage", CollectedDataType.Accumulation));
            services.AddScoped<IDataAggregatorRepository<CollectedData>, DataAggregatorRepository>(
                options => new DataAggregatorRepository(connectionString, "watcher-data-storage"));
            services.AddScoped<ILogRepository, LogRepository>(
                options => new LogRepository(connectionString, "watcher-data-storage"));
            services.AddScoped<IInstanceAnomalyReportsRepository, InstanceAnomalyReportsRepository>(
                options => new InstanceAnomalyReportsRepository(connectionString, "watcher-data-storage"));
        }

        public virtual void ConfigureFileStorage(IServiceCollection services)
        {
            if (Env.IsProduction())
            {
                services.AddScoped<IFileStorageProvider, FileStorageProvider>(
                    prov => new FileStorageProvider(Configuration.GetConnectionString("AzureFileStorageConnection")));
            }
            else
            {
                services.AddScoped<IFileStorageProvider, LocalFileStorageProvider>(
                    prov => new LocalFileStorageProvider(Configuration));
            }
        }

        public virtual void ConfigureAutomapper(IServiceCollection services)
        {
            var configuration = new MapperConfiguration(cfg =>
            {
                cfg.CreateMissingTypeMaps = true;
                cfg.ValidateInlineMaps = false;
                cfg.AddProfile<UsersProfile>();
                cfg.AddProfile<DashboardsProfile>();
                cfg.AddProfile<OrganizationProfile>();
                cfg.AddProfile<UserOrganizationProfile>();
                cfg.AddProfile<NotificationSettingsProfile>();
                cfg.AddProfile<ChatProfile>();
                cfg.AddProfile<MessageProfile>();
                cfg.AddProfile<FeedbackProfile>();
                cfg.AddProfile<InstanceAnomalyReportProfile>();
                cfg.AddProfile<RoleProfile>();
                cfg.AddProfile<ResponseProfile>();
                cfg.AddProfile<InstancesProfile>();
                cfg.AddProfile<OrganizationInvitesProfile>();
                cfg.AddProfile<CollectedDataProfile>();
                cfg.AddProfile<CollectorActionLogProfile>();
                cfg.AddProfile<ThemeProfile>();
            });

            services.AddSingleton(configuration.CreateMapper());
        }

        public virtual void ConfigureDatabase(IServiceCollection services)
        {
            var connectionString = Configuration.GetConnectionString(Env.IsProduction() ? "AzureDbConnection" : "DefaultConnection");

            services.AddDbContext<WatcherDbContext>(options =>
                options.UseSqlServer(connectionString, b => b.MigrationsAssembly(Configuration["MigrationsAssembly"])));
        }

        public virtual void ConfigureLogger()
        {
            var outputTemplate = "[{Timestamp:HH:mm:ss} {Level}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}{properties}{NewLine}";

            if (Env.IsDevelopment())
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

        public virtual void ConfigureAuth(IServiceCollection services)
        {
            services.AddAuthentication(o =>
            {
                o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.Events = new JwtBearerEvents()
                {
                    OnMessageReceived = context =>
                    {
                        if ((!context.Request.Path.Value.Contains("/notifications")
                            && !context.Request.Path.Value.Contains("/dashboards")
                            && !context.Request.Path.Value.Contains("/chatsHub")
                            && !context.Request.Path.Value.Contains("/invites"))

                            || !context.Request.Query.ContainsKey("Authorization")
                            || !context.Request.Query.ContainsKey("WatcherAuthorization"))
                        {
                            return Task.CompletedTask;
                        }

                        var watcherToken = context.Request.Query["WatcherAuthorization"];
                        var firebaseToken = $"Bearer {context.Request.Query["Authorization"]}";
                        context.Request.Headers.TryAdd("Authorization", firebaseToken);
                        context.Request.Headers.TryAdd("WatcherAuthorization", watcherToken);

                        return Task.CompletedTask;
                    }
                };

                options.Authority = Configuration["FirebaseOptions:Authority"];
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = Configuration["FirebaseOptions:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = Configuration["FirebaseOptions:Audience"],
                    ValidateLifetime = true
                };
            });

            services.AddAuthorization(o =>
            {
                o.AddPolicy("SomePolicy", b =>
                {
                    b.RequireAuthenticatedUser();
                });
                o.AddPolicy("AdminPolicy", b =>
                {
                    b.RequireAuthenticatedUser();
                    b.RequireClaim(ClaimTypes.Role, "Admin");
                    b.AuthenticationSchemes = new List<string> { JwtBearerDefaults.AuthenticationScheme };
                });
            });
        }

        private static void UpdateDatabase(IApplicationBuilder app)
        {
            using var serviceScope = app.ApplicationServices
                .GetRequiredService<IServiceScopeFactory>()
                .CreateScope();
            using var context = serviceScope.ServiceProvider.GetService<WatcherDbContext>();
            context?.Database?.Migrate();
        }
    }
}
