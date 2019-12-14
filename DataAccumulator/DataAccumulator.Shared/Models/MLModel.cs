using Microsoft.ML.Data;
using System;

namespace DataAccumulator.Shared.Models
{
    public class MLModel
    {
        [LoadColumn(0)]
        public DateTime Time { get; set; }

        [LoadColumn(1)]
        public float Data { get; set; }
    }

    public class SpikePrediction
    {
        // Vector to hold alert, score, p-value values
        [VectorType(3)]
        public double[] Prediction { get; set; }
    }

    public class MLAnalysisResponse
    {
        public MLModel Model { get; set; }
        public bool Anomaly { get; set; }
        public bool Warning { get; set; }
    }
}
