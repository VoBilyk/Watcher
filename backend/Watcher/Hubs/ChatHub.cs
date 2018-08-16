﻿using System.Collections.Generic;
using Watcher.Common.Dtos;
using Watcher.Common.Enums;

namespace Watcher.Hubs
{
    using System;
    using System.Security.Claims;
    using System.Threading.Tasks;

    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.SignalR;

    using Watcher.Common.Requests;
    using Watcher.Core.Interfaces;

    public class ChatHub : Hub
    {
        private readonly IChatsService _chatsService;
        private readonly IMessagesService _messagesService;
        private readonly IOrganizationService _organizationService;

        private static Dictionary<string, List<string>> userConnections = new Dictionary<string, List<string>>();

        public ChatHub(IChatsService chatsService, IMessagesService messagesService, IOrganizationService organizationService)
        {
            _chatsService = chatsService;
            _messagesService = messagesService;
            _organizationService = organizationService;
        }

        public async Task Send(MessageRequest messageRequest)
        {
            MessageDto message = await _messagesService.CreateEntityAsync(messageRequest);

            IEnumerable<UserDto> users = await _chatsService.GetUsersByChatIdAsync(messageRequest.ChatId);

            foreach (var userDto in users)
                await Clients.User(userDto.Id).SendAsync("ReceiveMessage", message);
        }

        public async Task InitializeChat(ChatRequest chatRequest, string userId)
        {
            ChatDto chatDto = await _chatsService.CreateEntityAsync(chatRequest);

            if (chatRequest.Type == ChatType.BetweenUsers && chatRequest.CreatedById != userId && userId != null)
            {
                await _chatsService.AddUserToChat(chatDto.Id, userId);
                await _chatsService.AddUserToChat(chatDto.Id, chatRequest.CreatedById);
            }
            else if (chatRequest.Type == ChatType.InOrganization)
            {
                OrganizationDto organizationDto = await _organizationService.GetEntityByIdAsync(chatRequest.OrganizationId);

                foreach (string id in organizationDto.UsersId)
                    await _chatsService.AddUserToChat(chatDto.Id, id);
            }

            await Clients.User(chatDto.CreatedBy.Id).SendAsync("ChatCreated", chatDto);
        }

        public override async Task OnConnectedAsync()
        {
            //await Clients.All.SendAsync("BroadcastMessage", Context.ConnectionId + "Connected");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            //await Clients.All.SendAsync("BroadcastMessage", $"Connection: {Context.ConnectionId} disconnected {exception?.Message}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}