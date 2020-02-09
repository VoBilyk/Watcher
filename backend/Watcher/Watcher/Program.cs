using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Serilog;
using System;
using System.IO;

namespace Watcher
{
    public sealed class Program
    {
        public static IConfiguration Configuration { get; } = GetConfigurationRoot();
        public static string EnviromentName { get; } = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        public static bool UseIIS { get; }

        public static int Main(string[] args)
        {
            try
            {
                var host = CreateHostBuilder(args).Build();
                Log.Information("Starting Watcher Web App...");

                host.Run();
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
                    if (UseIIS)
                    {
                        webBuilder.UseIISIntegration();
                    }
                    else
                    {
                        webBuilder.UseKestrel(options =>
                        {
                            options.Limits.MaxRequestBodySize = 1024 * 1024 * 100; // 100MB
                        });
                    }

                    webBuilder.UseContentRoot(Directory.GetCurrentDirectory());
                    webBuilder.UseSetting("detailedErrors", "true");
                    webBuilder.UseConfiguration(Configuration);
                    webBuilder.UseStartup<Startup>();
                    webBuilder.UseSerilog();
                    webBuilder.CaptureStartupErrors(true);
                });

        private static IConfigurationRoot GetConfigurationRoot()
        {
            var configurationBuilder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{EnviromentName ?? Environments.Production}.json", optional: true)
                .AddEnvironmentVariables();

            if (EnviromentName == Environments.Development)
            {
                configurationBuilder.AddUserSecrets<Program>(false);
            }

            return configurationBuilder.Build();
        }
    }
}
