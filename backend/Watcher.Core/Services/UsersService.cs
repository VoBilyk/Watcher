﻿using Watcher.DataAccess.Entities;

namespace Watcher.Core.Services
{
    using System.Collections.Generic;
    using System.Threading.Tasks;

    using AutoMapper;

    using Watcher.Common.Dtos;
    using Watcher.Common.Requests;
    using Watcher.Core.Interfaces;
    using Watcher.DataAccess.Interfaces;

    public class UsersService : IUsersService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public UsersService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserDto>> GetAllEntitiesAsync()
        {
            var samples = await _uow.UsersRepository.GetRangeAsync();

            var dtos = _mapper.Map<List<User>, List<UserDto>>(samples);

            return dtos;
        }

        public async Task<UserDto> GetEntityByIdAsync(string id)
        {
            var sample = await _uow.UsersRepository.GetFirstOrDefaultAsync(s => s.Id == id);

            if (sample == null) return null;

            var dto = _mapper.Map<User, UserDto>(sample);

            return dto;
        }

        public async Task<UserDto> CreateEntityAsync(UserRegisterRequest request)
        {
            var user = await _uow.UsersRepository.GetFirstOrDefaultAsync(u => u.Id == request.Uid);

            if (user != null)
            {
                return _mapper.Map<User, UserDto>(user);
                // throw new HttpStatusCodeException(HttpStatusCode.BadRequest, "User with such Uid already exists");
            }

            var entity = _mapper.Map<UserRegisterRequest, User>(request);
            //var organization = new Organization()
            //                       {
            //                           Name = request.CompanyName
            //                       };
            //entity.LastPickedOrganization = organization;
            //e

            await _uow.UsersRepository.CreateAsync(entity);
            var result = await _uow.SaveAsync();
            if (!result)
            {
                return null;
            }

            return _mapper.Map<User, UserDto>(entity);
        }

        public async Task<bool> UpdateEntityByIdAsync(UserUpdateRequest request, string id)
        {
            var entity = _mapper.Map<UserUpdateRequest, User>(request);
            entity.Id = id;

            // In returns updated entity, you could do smth with it or just leave as it is
            var updated = await _uow.UsersRepository.UpdateAsync(entity);
            var result = await _uow.SaveAsync();

            return result;
        }

        public async Task<bool> DeleteEntityByIdAsync(string id)
        {
            await _uow.UsersRepository.DeleteAsync(id);

            var result = await _uow.SaveAsync();

            return result;
        }
    }
}
