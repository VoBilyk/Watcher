﻿using DataAccumulator.DataAccessLayer.Interfaces;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace DataAccumulator.DataAccessLayer.Entities
{
    public class InstanceSettings : IEntity
    {
        [BsonId]
        // standard BSonId generated by MongoDb
        public ObjectId InternalId { get; set; }

        // Id - InstanceValidator identification number
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; }
        // ClientId - Instance identification number
        [BsonRepresentation(BsonType.String)]
        public Guid ClientId { get; set; }
        public bool IsActive { get; set; }

        public bool AggregationForHour { get; set; }
        public bool AggregationForDay { get; set; }
        public bool AggregationForWeek { get; set; }
        public bool AggregationForMonth { get; set; }

        public bool RamValidator { get; set; }
        public float RamUsagePercentageMax { get; set; }

        public bool LocalDiskVallidator { get; set; }
        public float LocalDiskUsagePercentageMax { get; set; }

        public bool CpuValidator { get; set; }
        public float CpuUsagePercentageMax { get; set; }
    }
}
