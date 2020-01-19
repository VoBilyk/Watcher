﻿using Microsoft.EntityFrameworkCore.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Watcher.DataAccess.Interfaces.Repositories
{
    using Watcher.DataAccess.Entities;

    public interface IUserOrganizationRepository
    {
        Task<UserOrganization> CreateAsync(UserOrganization entity);

        void Delete(int companyId, string userId);

        Task<List<UserOrganization>> GetRangeAsync(Func<IQueryable<UserOrganization>, IIncludableQueryable<UserOrganization, object>> include = null, bool disableTracking = true);

        Task<UserOrganization> UpdateAsync(UserOrganization userOrganization);
        Task<List<UserOrganization>> GetAllByOrganizationId(int id);
    }
}