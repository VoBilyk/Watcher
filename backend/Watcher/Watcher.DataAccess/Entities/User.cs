﻿namespace Watcher.DataAccess.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using Watcher.Common.Interfaces.Entities;

    public class User : Entity<string>, ISoftDeletable
    {
        public User() { }

        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public override string Id { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        [Required]
        public string DisplayName { get; set; }

        [Required]
        public string Email { get; set; }

        public string EmailForNotifications { get; set; }

        [Required]
        public bool IsActive { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        public bool IsDeleted { get; set; }

        public string PhotoURL { get; set; }

        public string Bio { get; set; }

        public int RoleId { get; set; }
        public Role Role { get; set; }

        public int? LastPickedOrganizationId { get; set; }
        public Organization LastPickedOrganization { get; set; }

        public IList<NotificationSetting> NotificationSettings { get; set; }

        public IList<UserOrganization> UserOrganizations { get; set; }

        public IList<Notification> Notifications { get; set; }

        public IList<Feedback> Feedbacks { get; set; }

        public IList<Response> Responses { get; set; }

        public IList<Message> Messages { get; set; }

        public IList<UserChat> UserChats { get; set; }

        public IList<Chat> CreatedChats { get; set; }

        public IList<Organization> CreatedOrganizations { get; set; }

        public IList<OrganizationInvite> OrganizationInvites { get; set; }

        public void OnDelete()
        {
            foreach (var notificationSetting in NotificationSettings)
            {
                notificationSetting.OnDelete();
            }

            foreach (var feedback in Feedbacks)
            {
                feedback.OnDelete();
            }

            foreach (var response in Responses)
            {
                response.OnDelete();
            }

            foreach (var message in Messages)
            {
                message.OnDelete();
            }

            foreach (var chat in CreatedChats)
            {
                chat.OnDelete();
            }

            foreach (var organization in CreatedOrganizations)
            {
                organization.OnDelete();
            }

            foreach (var organizationInvite in OrganizationInvites)
            {
                organizationInvite.OnDelete();
            }

            IsDeleted = true;
        }
    }
}
