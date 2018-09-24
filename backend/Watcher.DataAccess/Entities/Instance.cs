﻿namespace Watcher.DataAccess.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using Watcher.Common.Interfaces.Entities;
    
    public class Instance : Entity<int>, ISoftDeletable
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public override int Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Address { get; set; }

        [Required]
        public string Platform { get; set; }

        public bool IsActive { get; set; }

        public Guid GuidId { get; set; }

        public bool AggregationForHour { get; set; }
        public bool AggregationForDay { get; set; }
        public bool AggregationForWeek { get; set; }
        public bool AggregationForMonth { get; set; }

        public float CpuMaxPercent { get; set; }
        public float RamMaxPercent { get; set; }
        public float DiskMaxPercent { get; set; }

        public DateTime StatusCheckedAt { get; set; }


        public int OrganizationId { get; set; }
        public Organization Organization { get; set; }
        
        public IList<Dashboard> Dashboards { get; set; }

        [Required]
        public bool IsDeleted { get; set; }

        public void OnDelete()
        {
            if (Dashboards != null)
            {
                foreach (var dashboard in Dashboards)
                {
                    dashboard.OnDelete();
                }
            }

            IsDeleted = true;
        }
    }
}
