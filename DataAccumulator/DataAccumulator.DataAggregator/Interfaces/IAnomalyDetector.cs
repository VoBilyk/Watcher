using System.Collections.Generic;
using DataAccumulator.Shared.Models;

namespace DataAccumulator.DataAggregator.Interfaces
{
    public interface IAnomalyDetector
    {
        AzureMLAnomalyReport AnalyzeData(IEnumerable<CollectedDataDto> collectedData);
    }
}
