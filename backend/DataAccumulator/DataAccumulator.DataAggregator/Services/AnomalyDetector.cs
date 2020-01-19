using System;
using System.Collections.Generic;
using System.Linq;

using DataAccumulator.DataAggregator.Interfaces;
using DataAccumulator.DataAggregator.Providers;
using DataAccumulator.Shared.Models;

namespace DataAccumulator.DataAggregator.Services
{
    public class AnomalyDetector : IAnomalyDetector
    {
        private readonly IMLProvider _mlProvider;

        public AnomalyDetector(IMLProvider mlProvider)
        {
            _mlProvider = mlProvider;
        }

        public AzureMLAnomalyReport AnalyzeData(IEnumerable<CollectedDataDto> collectedData)
        {
            var collectedDataDtos = collectedData as CollectedDataDto[] ?? collectedData.ToArray();

            var cpuAnalysis = _mlProvider.CheckAnomaly(MapInput(collectedDataDtos, x => x.CpuUsagePercentage));
            var ramAnalysis = _mlProvider.CheckAnomaly(MapInput(collectedDataDtos, x => x.RamUsagePercentage));
            var diskAnalysis = _mlProvider.CheckAnomaly(MapInput(collectedDataDtos, x => x.LocalDiskUsagePercentage));

            return new AzureMLAnomalyReport
            {
                Date = DateTime.UtcNow,
                AnomalyGroups = new List<AzureMLAnomalyGroup>
                {
                    GetAnomalyGroup("CPU", cpuAnalysis),
                    GetAnomalyGroup("RAM", ramAnalysis),
                    GetAnomalyGroup("DISK", diskAnalysis),
                }
            };
        }

        private IEnumerable<MLModel> MapInput(IEnumerable<CollectedDataDto> data, Func<CollectedDataDto, float> selector)
        {
            return data.Select(x => new MLModel
            {
                Time = x.Time,
                Data = selector(x)
            });
        }

        private AzureMLAnomalyGroup GetAnomalyGroup(string name, List<MLAnalysisResponse> outputs)
            => new AzureMLAnomalyGroup
            {
                Name = name,
                Total = outputs.Count,
                Warnings = GetAnomalies(outputs, x => x.Anomaly),
                Anomalies = GetAnomalies(outputs, x => x.Warning && !x.Anomaly),
            };

        private List<AzureMLAnomaly> GetAnomalies(IEnumerable<MLAnalysisResponse> collection, Func<MLAnalysisResponse, bool> predicate)
            => collection.Where(predicate).Select(x => new AzureMLAnomaly { Time = x.Model.Time, Data = x.Model.Data }).ToList();

    }
}
