import {EventEmitter, Injectable} from '@angular/core';
import {HubConnection} from '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { OrganizationInvite } from '../../shared/models/organization-invite.model';

@Injectable()
export class OrganizationInvitesHub {
  private hubConnection: HubConnection | undefined;
  private isConnect: boolean;

  onAddInvite = new EventEmitter<OrganizationInvite>();
  onUpdateInvite = new EventEmitter<OrganizationInvite>();
  onDeleteInvite = new EventEmitter<number>();

  connectionEstablished = new EventEmitter<Boolean>();

  constructor(private authService: AuthService) {
    this.startInviteHubConnection();
  }

  private createConnection(firebaseToken: string, watcherToken: string) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.server_url}/invites?Authorization=${firebaseToken}&WatcherAuthorization=${watcherToken}`)
      .configureLogging(signalR.LogLevel.None)
      .build();

      return this.hubConnection;
  }

  private startInviteHubConnection(): void {
    if (this.isConnect || !this.authService.getCurrentUserLS()) {
      return;
    }

    this.authService.getTokens().subscribe(([firebaseToken, watcherToken]) => {
      console.log('OrganizationInvitesHub trying to connect');
      this.createConnection(firebaseToken, watcherToken)
        .start()
        .then(() => {
          console.log('OrganizationInvitesHub connected');
          this.isConnect = true;
          this.registerOnServerEvents();
        });
    });
  }

  private registerOnServerEvents(): void {
    // On Add event
    this.hubConnection.on('AddInvite', (data: OrganizationInvite) => {
      console.log(`Add invite: ${data}`);
      this.onAddInvite.emit(data);
    });

    // On Update event
    this.hubConnection.on('UpdateInvite', (data: OrganizationInvite) => {
      console.log(`Update invite: ${data}`);
      this.onUpdateInvite.emit(data);
    });

    // On Delete event
    this.hubConnection.on('DeleteInvite', (id: number) => {
      console.log(`Delete invite: ${id}`);
      this.onDeleteInvite.emit(id);
    });

    // On Close event
    this.hubConnection.onclose(err => {
      console.log('OrganizationInvitesHub connection closed');
      console.error(err);
      this.isConnect = false;
      this.startInviteHubConnection();
    });
  }

  public disconnect() {
    this.onAddInvite = new EventEmitter<OrganizationInvite>();
    this.onUpdateInvite = new EventEmitter<OrganizationInvite>();
    this.onDeleteInvite = new EventEmitter<number>();
    this.connectionEstablished = new EventEmitter<Boolean>();
  }
}
