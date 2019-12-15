﻿using Microsoft.EntityFrameworkCore;

namespace Watcher.Core.Services
{
    using AutoMapper;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Watcher.Common.Dtos;
    using Watcher.Common.Requests;
    using Watcher.Core.Interfaces;
    using Watcher.DataAccess.Entities;
    using Watcher.DataAccess.Interfaces;

    public class UserOrganizationService : IUserOrganizationService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly IFileStorageProvider _fileStorageProvider;

        public UserOrganizationService(IUnitOfWork uow, IMapper mapper, IFileStorageProvider fileStorageProvider)
        {
            _uow = uow;
            _mapper = mapper;
            _fileStorageProvider = fileStorageProvider;
        }

        public async Task<IEnumerable<UserOrganizationDto>> GetAllEntitiesAsync()
        {
            var entities = await _uow.UserOrganizationRepository.GetRangeAsync(include: x => x
                .Include(o => o.User)
                .Include(o => o.Organization)
                .Include(o => o.OrganizationRole));

            var dtos = _mapper.Map<List<UserOrganization>, List<UserOrganizationDto>>(entities);

            return dtos;
        }

        public async Task<IEnumerable<UserOrganizationDto>> GetEntitiesByOrganizationId(int organizationId)
        {
            var entities = await _uow.UserOrganizationRepository.GetAllByOrganizationId(organizationId);
            if (entities == null)
            {
                return null;
            }

            var dtos = _mapper.Map<List<UserOrganization>, List<UserOrganizationDto>>(entities);
            return dtos;
        }

        public async Task<UserOrganizationDto> UpdateEntityAsync(UserOrganizationRequest request)
        {
            var entity = _mapper.Map<UserOrganizationRequest, UserOrganization>(request);

            var res = await _uow.UserOrganizationRepository.UpdateAsync(entity);
            var result = await _uow.SaveAsync();
            if (!result)
            {
                return null;
            }

            if (entity == null)
            {
                return null;
            }

            return _mapper.Map<UserOrganization, UserOrganizationDto>(res);
        }

        public async Task<UserOrganizationDto> CreateEntityAsync(UserOrganizationRequest request)
        {
            var entity = _mapper.Map<UserOrganizationRequest, UserOrganization>(request);
            var result = false;

            var CreatedEntity = await _uow.UserOrganizationRepository.CreateAsync(entity);
            result = await _uow.SaveAsync();

            if (!result)
            {
                return null;
            }

            if (entity == null)
            {
                return null;
            }

            var dto = _mapper.Map<UserOrganization, UserOrganizationDto>(entity);

            return dto;
        }

        public async Task<bool> DeleteEntityAsync(int companyId, string userId)
        {
            _uow.UserOrganizationRepository.Delete(companyId, userId);

            var result = await _uow.SaveAsync();

            return result;
        }

        public async Task<OrganizationRoleDto> GetUserOrganizationRoleAsync(string userId, int organizationId)
        {
            var entities = await _uow.UserOrganizationRepository.GetAllByOrganizationId(organizationId);
            if (entities == null)
            {
                return null;
            }

            var userOrganization = entities.FirstOrDefault(u => u.UserId == userId);
            if (userOrganization == null)
            {
                return null;
            }

            var roleDto = _mapper.Map<OrganizationRole, OrganizationRoleDto>(userOrganization.OrganizationRole);
            return roleDto;
        }
    }
}
