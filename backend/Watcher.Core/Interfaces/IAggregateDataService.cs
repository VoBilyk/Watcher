namespace Watcher.Core.Interfaces
{
    using DataAccumulator.Shared.Models;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IAggregateDataService
    {
        Task<IEnumerable<CollectedDataDto>> GetAggregatedDataInTime(Guid id, CollectedDataType collectedDataType,
            DateTime timeFrom, DateTime timeTo, int page = 1, int count = 10);

        Task<long> GetCountOfEntities(Guid id, CollectedDataType collectedDataType, DateTime timeFrom, DateTime timeTo);
    }
}
