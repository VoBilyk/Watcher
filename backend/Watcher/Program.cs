using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.WindowsAzure.Storage;
using Serilog;
using Serilog.Events;
using System;
using System.IO;

namespace Watcher
{
    public class Program
    {
        public static IConfiguration Configuration { get; } = GetConfigurationRoot();

        private static IConfigurationRoot GetConfigurationRoot()
        {
            var enviroment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            var configurationBuilder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{enviroment ?? Environments.Production}.json", optional: true)
                .AddEnvironmentVariables();

            if (enviroment == Environments.Development)
            {
                configurationBuilder.AddUserSecrets<Program>(false);
            }

            return configurationBuilder.Build();
        }

        public static int Main(string[] args)
        {
            ConfigureLogger();

            try
            {
                Log.Information("Starting Watcher Web App...");

                CreateHostBuilder(args).Build().Run();

                return 0;
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Host terminated unexpectedly");
                return 1;
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    //webBuilder.UseKestrel(options =>
                    //{
                    //    options.Limits.MaxRequestBodySize = 1024 * 1024 * 100; // 100MB
                    //});
                    webBuilder.UseContentRoot(Directory.GetCurrentDirectory());
                    webBuilder.UseSetting("detailedErrors", "true");
                    webBuilder.UseConfiguration(Configuration);
                    webBuilder.UseIISIntegration();
                    webBuilder.UseStartup<Startup>();
                    webBuilder.UseSerilog();
                    webBuilder.CaptureStartupErrors(true);
                });

        public static void ConfigureLogger()
        {
            var outputTemplate = "[{Timestamp:HH:mm:ss} {Level}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}{properties}{NewLine}";

            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == Environments.Production)
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

                return;
            }

            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(Configuration)
                .Enrich.FromLogContext()
                .WriteTo.Console(outputTemplate: outputTemplate)
                .CreateLogger();
        }
    }
}
