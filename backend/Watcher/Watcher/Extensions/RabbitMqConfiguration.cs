using Microsoft.AspNetCore.Builder;
using Watcher.Core.Interfaces;

namespace Watcher.Extensions
{
    public static class RabbitMqConfiguration
    {
        public static IApplicationBuilder UseRabbitListener(this IApplicationBuilder app)
        {
            app.ApplicationServices.GetService(typeof(IQueueProvider));
            return app;
        }
    }
}
