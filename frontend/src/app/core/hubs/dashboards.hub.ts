import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { Subject, BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CollectedData } from '../../shared/models/collected-data.model';
import { InstanceChecked } from '../../shared/models/instance-checked';

@Injectable()
export class DashboardsHub {
  private hubName = 'dashboards';
  private hubConnection: HubConnection;
  private closedManually: boolean;

  public connectionEstablished$ = new BehaviorSubject<boolean>(false);

  public instanceDataTick$ = new Subject<CollectedData>();
  public instanceStatusCheck$ = new Subject<InstanceChecked>();

  constructor(private authService: AuthService) { }

  connect() {
    if (this.connectionEstablished$.value || !this.authService.getCurrentUserLS()) {
      return;
    }

    this.closedManually = false;
    this.authService.getTokens().subscribe(([firebaseToken, watcherToken]) => {
      this.buildConnection(firebaseToken, watcherToken);
      console.log('Dashboards Hub trying to connect');
      this.hubConnection
        .start()
        .then(() => {
          console.log('Dashboards Hub connected');
          this.connectionEstablished$.next(true);
          this.registerOnEvents();
        })
        .catch(() => console.log('Error while establishing connection (Dashboards Hub)'));
    });
  }

  private buildConnection(firebaseToken: string, watcherToken: string) {
    const connPath = `${environment.server_url}/${this.hubName}?Authorization=${firebaseToken}&WatcherAuthorization=${watcherToken}`;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(connPath)
      .configureLogging(LogLevel.None)
      .build();
  }

  private registerOnEvents() {
    this.hubConnection.on('InstanceDataTick', (info: CollectedData) => {
      info.time = new Date(info.time);
      this.instanceDataTick$.next(info);
    });

    this.hubConnection.on('InstanceStatusCheck', (info: InstanceChecked) => {
      info.statusCheckedAt = new Date(info.statusCheckedAt);
      this.instanceStatusCheck$.next(info);
    });

    this.hubConnection.onclose((error: Error) => {
      console.log('Dashboard Hub connection closed');
      this.connectionEstablished$.next(false);

      if (!this.closedManually) {
        console.error(error);
        this.connect();
      }
    });
  }

  subscribeToInstanceById(instanceGuidId: string): void {
    this.tryInvoke('SubscribeToInstanceById', instanceGuidId);
  }

  subscribeToOrganizationById(id: number) {
    this.tryInvoke('SubscribeToOrganizationById', id);
  }

  unSubscribeFromInstanceById(instanceGuidId: string) {
    this.tryInvoke('UnSubscribeFromInstanceById', instanceGuidId);
  }

  unSubscribeFromOrganizationById(id: number) {
    this.tryInvoke('UnSubscribeFromOrganizationById', id);
  }

  disconnect() {
    if (this.connectionEstablished$.value) {
      this.closedManually = true;
      this.hubConnection.stop();
    }
  }

  private tryInvoke<T>(methodName: string, data: T) {
    if (this.hubConnection) {
      this.hubConnection.invoke(methodName, data)
        .catch(err => console.error(err));
    }
  }
}
