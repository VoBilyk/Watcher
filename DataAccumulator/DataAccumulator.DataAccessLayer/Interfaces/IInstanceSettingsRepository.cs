﻿using DataAccumulator.DataAccessLayer.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DataAccumulator.DataAccessLayer.Interfaces
{
    public interface IInstanceSettingsRepository<TEntity> where TEntity : IEntity
    {
        Task<IEnumerable<TEntity>> GetAllEntitiesAsync();
        Task<TEntity> GetEntityAsync(Guid id);
        Task<TEntity> GetEntityByInstanceIdAsync(Guid clientId);
        Task<InstanceSettings> GetLastEntityByInstanceIdAsync(Guid clientId);
        Task AddEntityAsync(TEntity item);
        Task<bool> UpdateEntityAsync(TEntity item);
        Task<bool> RemoveEntityAsync(Guid id);
        Task<bool> RemoveAllEntitiesAsync();
        Task<bool> EntityExistsAsync(Guid id);
    }
}
