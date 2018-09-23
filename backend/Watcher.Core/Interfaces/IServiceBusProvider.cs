namespace Watcher.Core.Interfaces
{
    using ServiceBus.Shared.Messages;
    using System.Threading.Tasks;

    public interface IServiceBusProvider
    {
        Task SendInstanceSettingsAsync(InstanceSettingsMessage message);
    }
}
