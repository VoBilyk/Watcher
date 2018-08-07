﻿namespace Watcher.DataAccess.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class User : Entity<string>
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public override string Id { get; set; }

        [Required]
        public string FirstName { get; set; }

        [Required]
        public string SecondName { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public bool IsActive { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public string NickName { get; set; }

        public string Bio { get; set; }
        
        public int RoleId { get; set; }
        public Role Role { get; set; }

        public int NotificationSettingId { get; set; }
        public NotificationSetting NotificationSetting { get; set; }

        public IList<UserOrganization> UserOrganizations { get; set; }

        public IList<Notification> Notifications { get; set; }

        public IList<Feedback> Feedbacks { get; set; }

        public IList<Response> Responses { get; set; }

        public IList<Message> Messages { get; set; }

        public IList<Chat> CreatedChats { get; set; }
    }
}
