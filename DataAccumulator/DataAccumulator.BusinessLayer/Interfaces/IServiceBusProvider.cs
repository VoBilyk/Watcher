namespace DataAccumulator.BusinessLayer.Interfaces
{
    using System.Threading.Tasks;

    using ServiceBus.Shared.Messages;

    public interface IServiceBusProvider
    {
        Task SendDataMessage(InstanceCollectedDataMessage message);
        
        Task SendErrorMessage(InstanceErrorMessage message);
        
        Task SendNotificationMessage(InstanceNotificationMessage message);

        Task SendAnomalyReportMessage(InstanceAnomalyReportMessage message);
    }
}
