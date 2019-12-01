import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { AuthService } from '../services/auth.service';

import { Message } from '../../shared/models/message.model';
import { Chat } from '../../shared/models/chat.model';
import { MessageRequest } from '../../shared/requests/message-request';
import { ChatRequest } from '../../shared/requests/chat-request';
import { ChatUpdateRequest } from '../../shared/requests/chat-update-request';

@Injectable()
export class ChatHub {
  private hubName = 'chatsHub';

  private hubConnection: HubConnection;
  private isConnect: boolean;

  messageReceived = new Subject<Message>();
  chatMessagesWasRead = new Subject<number>();
  chatCreated = new Subject<Chat>();
  chatChanged = new Subject<Chat>();
  chatDeleted = new Subject<Chat>();

  constructor(private authService: AuthService) {
    this.startConnection();
  }

  private buildConnection(firebaseToken: string, watcherToken: string) {
    const connPath = `${environment.server_url}/${this.hubName}?Authorization=${firebaseToken}&WatcherAuthorization=${watcherToken}`;
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(connPath)
      .configureLogging(LogLevel.None)
      .build();

    return this.hubConnection;
  }

  private startConnection(): void {
    if (this.isConnect || !this.authService.getCurrentUserLS()) {
      return;
    }

    this.authService.getTokens().subscribe(([firebaseToken, watcherToken]) => {
      console.log('ChatHub trying to connect');
      this.buildConnection(firebaseToken, watcherToken)
        .start()
        .then(() => {
          console.log('ChatHub connected');
          this.isConnect = true;
          this.registerOnEvents();
        })
        .catch(() => {
          console.log('Error while establishing connection (ChatHub)');
          setTimeout(() => this.startConnection(), 3000);
        });
    });
  }

  private registerOnEvents(): void {
    this.hubConnection.on('ReceiveMessage', (data: any) => {
      this.messageReceived.next(data);
      console.log('Message Received');
    });

    this.hubConnection.on('ChatCreated', (data: any) => {
      this.chatCreated.next(data);
      console.log('Chat created');
    });

    this.hubConnection.on('ChatChanged', (data: any) => {
      this.chatChanged.next(data);
      console.log('ChatChanged');
    });

    this.hubConnection.on('ChatChanged', (data: any) => {
      this.chatChanged.next(data);
      console.log('ChatChanged');
    });

    this.hubConnection.on('ChatDeleted', (data: any) => {
      this.chatDeleted.next(data);
      console.log('ChatDeleted');
    });

    this.hubConnection.onclose(error => {
      this.isConnect = false;
      console.log('ChatHub connection closed');
      console.error(error);
      this.startConnection();
    });
  }

  createNewChat(chat: ChatRequest) {
    this.hubConnection.invoke('InitializeChat', chat)
      .catch(err => console.error(err));
  }

  markMessageAsRead(messageId: number) {
    this.hubConnection.invoke('MarkMessageAsRead', messageId)
      .catch(err => console.error(err));
  }

  updateChat(chat: ChatUpdateRequest, chatId: number) {
    this.hubConnection.invoke('UpdateChat', chat, chatId)
      .catch(err => console.error(err));
  }

  sendMessage(message: MessageRequest) {
    this.hubConnection.invoke('Send', message)
      .catch(err => console.error(err));
  }

  addUserToChat(userId: string, chatId: number) {
    this.hubConnection.invoke('AddUserToChat', chatId, userId)
      .catch(err => console.error(err));
  }

  deleteUserFromChat(userId: string, chatId: number) {
    this.hubConnection.invoke('DeleteUserFromChat', chatId, userId)
      .catch(err => console.error(err));
  }

  deleteChat(chatId: number) {
    this.hubConnection.invoke('DeleteChat', chatId)
      .catch(err => console.error(err));
  }

  disconnect() {
    this.messageReceived = new Subject<Message>();
    this.chatMessagesWasRead = new Subject<number>();
    this.chatCreated = new Subject<Chat>();
    this.chatChanged = new Subject<Chat>();
    this.chatDeleted = new Subject<Chat>();
  }
}
