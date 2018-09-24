﻿namespace Watcher.Core.Hubs
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;


    using Microsoft.AspNetCore.SignalR;
    using Microsoft.AspNetCore.Authorization;

    using Watcher.Core.Interfaces;
    using Watcher.Common.Dtos;
    using Watcher.Common.Helpers.Extensions;
    using Watcher.Common.Enums;
    using Watcher.Common.Requests;

    public class NotificationsHub : Hub
    {
        public static readonly Dictionary<string, List<string>> UsersConnections = new Dictionary<string, List<string>>();

        private readonly INotificationService _notificationService;

        public NotificationsHub(INotificationService notificationService)
        {
            this._notificationService = notificationService;
        }

        [Authorize]
        public async Task SendNotification(NotificationRequest notificationRequest, NotificationType type)
        {
            notificationRequest.Type = type;
            var result = await _notificationService.CreateEntityAsync(notificationRequest);

            //if (result != null)
            //{
            //    foreach (string connectionId in UsersConnections[notificationDto.UserId])
            //        await Clients.Client(connectionId).SendAsync("AddNotification", result);
            //}
        }

        [Authorize]
        public async Task Send(string userId, string message)
        {
            var notificationRequest = new NotificationRequest()
            {
                UserId = userId,
                Text = message,
                CreatedAt = DateTime.Now,
                Type = NotificationType.Info
            };

            await _notificationService.CreateEntityAsync(notificationRequest);
        }

        [Authorize]
        public async Task DeleteNotification(NotificationDto notificationDto)
        {
            var result = await _notificationService.DeleteEntityByIdAsync(notificationDto.Id);
            if (result)
            {
                foreach (string connectionId in UsersConnections[notificationDto.UserId])
                    await Clients.User(notificationDto.UserId).SendAsync("DeleteNotification", notificationDto.Id);
            }
        }

        public override Task OnConnectedAsync()
        {
            if (Context.User.GetUserId() != null)
                AddUserConnection(Context.User.GetUserId(), Context.ConnectionId);
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            if (Context.User.GetUserId() != null)
                RemoveUserConnection(Context.User.GetUserId(), Context.ConnectionId);
            return base.OnDisconnectedAsync(exception ?? new Exception("Something went wrong"));
        }

        public void AddUserConnection(string userId, string connectionId)
        {
            if(string.IsNullOrWhiteSpace(userId)) return;
            
            if (UsersConnections.ContainsKey(userId))
                UsersConnections[userId].Add(connectionId);
            else
            {
                UsersConnections.Add(userId, new List<string> { connectionId });
            }
        }

        public bool RemoveUserConnection(string userId, string connectionId)
        {
            return UsersConnections.ContainsKey(userId) && UsersConnections[userId].Remove(connectionId);
        }
    }
}
