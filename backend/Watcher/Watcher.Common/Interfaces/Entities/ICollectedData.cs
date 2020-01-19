using System;

namespace Watcher.Common.Interfaces.Entities
{
    internal interface ICollectedData
    {
        Guid Id { get; set; }
        Guid ClientId { get; set; }
        DateTime Time { get; set; }
    }
}
