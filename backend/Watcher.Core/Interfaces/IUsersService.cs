﻿namespace Watcher.Core.Interfaces
{
    using System.Collections.Generic;
    using System.Threading.Tasks;

    using Watcher.Common.Dtos;
    using Watcher.Common.Requests;

    public interface IUsersService
    {
        Task<IEnumerable<UserDto>> GetAllEntitiesAsync();

        Task<IEnumerable<UserDto>> GetRangeOfEntitiesAsync(int page, int pageSize);

        Task<int> GetNumberOfEntitiesAsync();

        Task<IEnumerable<UserDto>> FindEntitiesAsync(string query);

        Task<UserDto> GetEntityByIdAsync(string id);

        Task<UserDto> CreateEntityAsync(UserRegisterRequest request);

        Task<bool> UpdateEntityByIdAsync(UserUpdateRequest request, string id);

        Task<bool> UpdateProfileByIdAsync(UserProfileDto request, string id);

        Task<bool> DeleteEntityByIdAsync(string id);

        Task<UserDto> GetEntityByEmailAsync(string email);

        Task<bool> UpdateLastPickedOrganizationAsync(string userId, int organizationId);
    }
}
