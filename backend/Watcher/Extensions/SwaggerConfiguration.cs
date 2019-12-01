using System;
using System.IO;

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.PlatformAbstractions;
using Microsoft.OpenApi.Models;

using Swashbuckle.AspNetCore.SwaggerUI;
using Watcher.Utils;

namespace Watcher.Extensions
{
    public static class SwaggerConfiguration
    {
        public static IServiceCollection ConfigureSwagger(this IServiceCollection services, IConfiguration configs)
        {
            services.AddSwaggerGen(options =>
            {
                options.OperationFilter<FormFileOperationFilter>();
                options.SwaggerDoc("v1", new OpenApiInfo
                {

                    Description = "Watcher Web Api",
                    Title = "Watcher Web Api",
                    Version = "v1",
                    Contact = new OpenApiContact
                    {
                        Name = configs["Contacts:fullName"],
                        Email = configs["Contacts:email"],
                        Url = new Uri(configs["Contacts:webSite"])
                    },
                    License = new OpenApiLicense
                    {
                        Name = "Apache 2.0",
                        Url = new Uri("http://www.apache.org/licenses/LICENSE-2.0.html")
                    }
                });

                var basePath = PlatformServices.Default.Application.ApplicationBasePath;
                var xmlPath = Path.Combine(basePath, "Watcher.xml");

                if (File.Exists(xmlPath))
                    options.IncludeXmlComments(xmlPath);
            });

            return services;
        }

        public static IApplicationBuilder UseConfiguredSwagger(this IApplicationBuilder app)
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
                {
                    c.DocumentTitle = "Watcher Web API";
                    c.RoutePrefix = "swagger";
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Watcher Web API");
                    c.DefaultModelExpandDepth(2);
                    c.DefaultModelRendering(ModelRendering.Example);
                    c.DefaultModelsExpandDepth(-1);
                    c.DisplayOperationId();
                    c.DisplayRequestDuration();
                    c.DocExpansion(DocExpansion.None);
                    c.EnableDeepLinking();
                    c.EnableFilter();
                    c.MaxDisplayedTags(10);
                    c.ShowExtensions();
                    c.SupportedSubmitMethods(SubmitMethod.Get,
                        SubmitMethod.Post,
                        SubmitMethod.Put,
                        SubmitMethod.Delete,
                        SubmitMethod.Head,
                        SubmitMethod.Options,
                        SubmitMethod.Patch,
                        SubmitMethod.Trace);
                });

            return app;
        }
    }
}
