﻿namespace Watcher.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Watcher.Common.Dtos;
    using Watcher.Common.Requests;
    using Watcher.Core.Interfaces;

    /// <summary>   
    /// Controller to Manage UserOrganization
    /// </summary>
    // [Authorize]
    [Route("[controller]")]
    [Produces("application/json")]
    [ApiController]
    public class UserOrganizationController : ControllerBase
    {
        /// <summary>
        /// The UserOrganization Service service
        /// </summary>
        private readonly IUserOrganizationService _userOrganizationService;

        /// <summary>
        /// Initializes a new instance of the <see cref="UserOrganizationController"/> class. 
        /// </summary>
        /// <param name="service">
        /// UserOrganization service
        /// </param>
        public UserOrganizationController(IUserOrganizationService service)
        {
            _userOrganizationService = service;
        }

        /// <summary>
        /// Get UserOrganization
        /// </summary>
        /// <returns>
        /// List of Dtos of UserOrganization
        /// </returns>
        /// <response code="500">Internal error on server</response>
        /// <response code="404">UserOrganization not found</response>
        /// <response code="403">You don`t have permission to create watch UserOrganization</response>
        /// <response code="400">Model is not valid</response>
        /// <response code="200">Success</response>
        [HttpGet]
        [AllowAnonymous]
        public virtual async Task<ActionResult<IEnumerable<UserOrganizationDto>>> Get()
        {
            var dtos = await _userOrganizationService.GetAllEntitiesAsync();
            if (!dtos.Any())
            {
                return NoContent();
            }

            return Ok(dtos);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public virtual async Task<ActionResult<IEnumerable<UserOrganizationDto>>> GetByOrganization(int id)
        {
            var dtos = await _userOrganizationService.GetEntitiesByOrganizationId(id);
            if (!dtos.Any())
            {
                return NoContent();
            }

            return Ok(dtos);
        }

        /// <summary>
        /// Add new UserOrganization
        /// </summary>
        /// <param name="request">UserOrganization create request</param>
        /// <returns>
        /// Dto of UserOrganization
        /// </returns>
        /// <response code="500">Internal error on server</response>
        /// <response code="404">UserOrganization not found</response>
        /// <response code="403">You don`t have permission to create UserOrganization</response>
        /// <response code="400">Model is not valid</response>
        /// <response code="200">Success</response>
        [HttpPost]
        public virtual async Task<ActionResult<UserOrganizationDto>> Create([FromBody] UserOrganizationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var dto = await _userOrganizationService.CreateEntityAsync(request);
            if (dto == null)
            {
                return StatusCode(500);
            }

            return dto;
        }

        // PUT: /userorganization
        [HttpPut]
        public virtual async Task<ActionResult> Update([FromBody] UserOrganizationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userOrganizationService.UpdateEntityAsync(request);
            if (result == null)
            {
                return StatusCode(500);
            }

            return NoContent();
        }

        [HttpGet("user/{uId}/organization/{oId}")]
        public virtual async Task<ActionResult> GetUserOrganizationRole(string uId, int oId)
        {
            var organizationRole = await _userOrganizationService.GetUserOrganizationRoleAsync(uId, oId);
            if (organizationRole == null)
            {
                return NotFound();
            }
            return Ok(organizationRole);
        }

        [HttpDelete] //("{companyId}") [FromBody] 
        public virtual async Task<ActionResult> Delete(int companyId, string userId)
        {


            var result = await _userOrganizationService.DeleteEntityAsync(companyId, userId);
            if (!result)
            {
                return StatusCode(500);
            }

            return NoContent();
        }
    }
}
