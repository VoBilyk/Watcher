using DataAccumulator.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Builder;

namespace DataAccumulator.WebAPI.Extensions
{
    public static class RabbitMqProviderConfiguration
    {
        public static IApplicationBuilder UseMessageQueue(this IApplicationBuilder app)
        {
            app.ApplicationServices.GetService(typeof(IQueueProvider));
            return app;
        }
    }
}