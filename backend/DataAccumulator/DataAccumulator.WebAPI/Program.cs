using System;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

using Serilog;

namespace DataAccumulator
{
    public sealed class Program
    {
        public static bool UseIIS { get; set; }
        
        public static string EnvironmentName { get; } = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

        public static int Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();

            try
            {
                Log.Information("Starting Data Accumulator...");
                host.Run();

                return 0;
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Data Accumulator Host terminated unexpectedly");
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
                        webBuilder.UseKestrel();
                    }

                    webBuilder.UseContentRoot(Directory.GetCurrentDirectory());
                    webBuilder.UseSetting("detailedErrors", "true");
                    webBuilder.UseConfiguration(GetConfigurationRoot());
                    webBuilder.UseStartup<Startup>();
                    webBuilder.UseSerilog();
                    webBuilder.CaptureStartupErrors(true);
                });

        private static IConfigurationRoot GetConfigurationRoot()
        {
            var configurationBuilder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{EnvironmentName ?? Environments.Production}.json", optional: true)
                .AddEnvironmentVariables();

            if (EnvironmentName == Environments.Development)
            {
                configurationBuilder.AddUserSecrets<Program>(false);
            }

            return configurationBuilder.Build();
        }
    }
}
