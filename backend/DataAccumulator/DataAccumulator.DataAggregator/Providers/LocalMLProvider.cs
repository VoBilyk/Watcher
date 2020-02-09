using DataAccumulator.DataAggregator.Interfaces;
using DataAccumulator.Shared.Models;
using Microsoft.ML;
using System.Collections.Generic;
using System.Linq;

namespace DataAccumulator.DataAggregator.Providers
{
    public class LocalMLProvider : IMLProvider
    {
        public List<MLAnalysisResponse> CheckAnomaly(IEnumerable<MLModel> data)
        {
            var mlContext = new MLContext();
            var dataView = mlContext.Data.LoadFromEnumerable(data);

            var predictions = DetectSpike(mlContext, data.Count(), dataView);

            return predictions.Select((pred, index) => new MLAnalysisResponse
            {
                Model = data.ElementAt(index),
                Anomaly = pred.Prediction[0] == 1 && pred.Prediction[2] == 0,
                Warning = pred.Prediction[0] == 1 && pred.Prediction[2] != 0
            }).ToList();
        }

        private IEnumerable<SpikePrediction> DetectSpike(MLContext mlContext, int count, IDataView productSales)
        {
            // Build a training pipeline for detecting spikes
            var pipeline = mlContext.Transforms.DetectSpikeBySsa(
                nameof(SpikePrediction.Prediction),
                nameof(MLModel.Data),
                confidence: 90,
                pvalueHistoryLength: count / 3,
                trainingWindowSize: 90,
                seasonalityWindowSize: 30);

            // Train the model
            var model = pipeline.Fit(CreateEmptyDataView(mlContext));

            // Predict spikes in the data
            var transformed = model.Transform(productSales);

            return mlContext.Data.CreateEnumerable<SpikePrediction>(transformed, reuseRowObject: false);
        }

        private IDataView CreateEmptyDataView(MLContext mlContext)
        {
            IEnumerable<MLModel> enumerableData = new List<MLModel>();
            return mlContext.Data.LoadFromEnumerable(enumerableData);
        }
    }
}
