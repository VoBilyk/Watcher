using System.Collections.Generic;
using DataAccumulator.Shared.Models;

namespace DataAccumulator.DataAggregator.Interfaces
{
    public interface IMLProvider
    {
        List<MLAnalysisResponse> CheckAnomaly(IEnumerable<MLModel> data);
    }
}
