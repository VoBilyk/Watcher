using DataAccumulator.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Builder;

namespace DataAccumulator.WebAPI.Extensions
{
    public static class RabbitMqProviderConfiguration
    {
        public static IApplicationBuilder UseRabbitListener(this IApplicationBuilder app)
        {
            app.ApplicationServices.GetService(typeof(IQueueProvider));
            return app;
        }
    }
}