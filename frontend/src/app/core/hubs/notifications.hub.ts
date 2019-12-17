import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { Notification } from '../../shared/models/notification.model';
import { NotificationType } from '../../shared/models/notification-type.enum';

@Injectable()
export class NotificationsHubService {
  private hubConnection: HubConnection;
  private isConnect: boolean;

  notificationReceived = new Subject<Notification>();
  notificationDeleted = new Subject<number>();

  constructor(private authService: AuthService) {
    this.startNotificationsHubConnection();
  }

  private createConnection(firebaseToken: string, watcherToken: string): void {
    const connPath = `${environment.server_url}/notifications?Authorization=${firebaseToken}&WatcherAuthorization=${watcherToken}`;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(connPath)
      .configureLogging(LogLevel.None)
      .build();
  }

  private startNotificationsHubConnection(): void {
    if (!this.authService.getCurrentUserLS() || this.isConnect) { return; }

    this.authService.getTokens().subscribe( ([firebaseToken, watcherToken]) => {
      this.createConnection(firebaseToken, watcherToken);
      console.log('NotificationsHub trying to connect');
      this.hubConnection.start()
        .then(() => {
          console.log('NotificationsHub connected');
          this.isConnect = true;
          this.registerOnServerEvents();
        });
    });
  }

  send(notification: Notification, type: NotificationType) {
    if (this.hubConnection) {
      return this.hubConnection.invoke('SendNotification', notification, type)
        .catch(err => console.error(err));
    }
  }

  delete(notification: Notification) {
    if (this.hubConnection) {
      return this.hubConnection.invoke('DeleteNotification', notification)
        .catch(err => console.error(err));
    }
  }

  private registerOnServerEvents(): void {
    this.hubConnection.on('AddNotification', (data: Notification) => {
      console.log('Notification added');
      this.notificationReceived.next(data);
    });

    this.hubConnection.on('DeleteNotification', (data: number) => {
      console.log('Notification deleted');
      this.notificationDeleted.next(data);
    });

    this.hubConnection.onclose(err => {
      console.log('NotificationsHub connection closed');
      console.error(err);
      this.isConnect = false;
      this.startNotificationsHubConnection();
    });
  }

  public disconnect() {
    this.notificationReceived.complete();
    this.notificationReceived = new Subject<Notification>();

    this.notificationDeleted.complete();
    this.notificationDeleted = new Subject<number>();
  }
}
