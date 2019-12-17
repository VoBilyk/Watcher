﻿namespace Watcher.Core.Interfaces
{
    using System.Collections.Generic;
    using System.Threading.Tasks;

    using Watcher.Common.Dtos;
    using Watcher.Common.Requests;

    public interface IOrganizationService
    {
        Task<IEnumerable<OrganizationDto>> GetAllEntitiesAsync();

        Task<IEnumerable<OrganizationDto>> GetRangeOfEntitiesAsync(int page, int pageSize);

        Task<int> GetNumberOfEntitiesAsync();

        Task<OrganizationDto> GetEntityByIdAsync(int id);

        Task<OrganizationDto> CreateEntityAsync(OrganizationRequest request);

        Task<bool> UpdateEntityByIdAsync(OrganizationUpdateRequest request, int id);

        Task<bool> DeleteEntityByIdAsync(int id);
    }
}