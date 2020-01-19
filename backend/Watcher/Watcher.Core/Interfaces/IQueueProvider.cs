namespace Watcher.Core.Interfaces
{
    using ServiceBus.Shared.Messages;
    using System.Threading.Tasks;

    public interface IQueueProvider
    {
        Task SendInstanceSettingsAsync(InstanceSettingsMessage message);
    }
}
