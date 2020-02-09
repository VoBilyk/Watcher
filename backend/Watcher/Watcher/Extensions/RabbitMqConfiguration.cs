using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Watcher.Core.Interfaces;

namespace Watcher.Extensions
{
    public static class RabbitMqConfiguration
    {
        public static IApplicationBuilder UseRabbitListener(this IApplicationBuilder app)
        {
            app.ApplicationServices.GetRequiredService<IQueueProvider>();
            return app;
        }
    }
}
