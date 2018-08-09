﻿using System;
using Watcher.Common.Enums;
using Watcher.Common.Interfaces.Entities;
using Watcher.Common.MoveToFrontend;

namespace Watcher.Common.Dtos
{  
    [ExportClassToTypescript]
    public class ChartDto : IEntity<int>
    {
        public int Id { get; set; }
        public ChartType Type { get; set; }
        public string Source { get; set; }
        public string ShowCommon { get; set; }
        public int Threshold { get; set; }
        public string MostLoaded { get; set; }
        public int DashboardId { get; set; }
        public DashboardDto Dashboard { get; set; }
    }
}
