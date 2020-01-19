namespace DataAccumulator.BusinessLayer.Interfaces
{
    using ServiceBus.Shared.Messages;
    using System.Threading.Tasks;

    public interface IQueueProvider
    {
        Task SendDataMessage(InstanceCollectedDataMessage message);

        Task SendErrorMessage(InstanceErrorMessage message);

        Task SendNotificationMessage(InstanceNotificationMessage message);

        Task SendAnomalyReportMessage(InstanceAnomalyReportMessage message);
    }
}
