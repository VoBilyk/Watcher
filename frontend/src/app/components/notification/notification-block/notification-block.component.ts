import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NotificationsHubService } from '../../../core/hubs/notifications.hub';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { SystemToastrService } from '../../../core/services/system-toastr.service';

import { NotificationType } from '../../../shared/models/notification-type.enum';
import { Notification } from '../../../shared/models/notification.model';


@Component({
  selector: 'app-notification-block',
  templateUrl: './notification-block.component.html',
  styleUrls: [
    './notification-block.component.sass',
    '../system-notification/system-notification.component.sass'
  ]
})
export class NotificationBlockComponent implements OnInit {
  @Output() counterChanged = new EventEmitter<number>();

  private unreadedNotifications = 0;

  notifications: Notification[] = [];
  type = NotificationType;
  isLoading: boolean;
  extendedNotification: number;

  constructor(
    private notificationsHubService: NotificationsHubService,
    private authService: AuthService,
    private notificationsService: NotificationService,
    private systemToastrService: SystemToastrService,
    private router: Router) { }

  ngOnInit() {
    this.loadNotifications();
    this.subscribeToEvents();
  }

  get notificationCounter() {
    return this.unreadedNotifications;
  }

  set notificationCounter(value: number) {
    this.unreadedNotifications = value;
    this.counterChanged.emit(value);
  }

  private subscribeToEvents(): void {
    this.notificationsHubService.notificationReceived.subscribe(value => {
      this.notificationCounter++;
      if (!value.notificationSetting.isMute) {
        this.systemToastrService.send(value);
      }
      this.notifications.unshift(value);
    });

    this.notificationsHubService.notificationDeleted.subscribe(id => {
      const index = this.notifications.findIndex(item => item.id === id);
      if (index !== -1) {
        if (!this.notifications[index].wasRead) {
          this.notificationCounter--;
        }
        this.notifications.splice(index, 1);
      }
    });
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationsService.getAll(this.authService.getCurrentUser().id).subscribe((value) => {
      this.notifications = value.reverse();
      this.notificationCounter = this.calcNotReadNotifications(value);
      this.isLoading = false;
    });
  }

  calcNotReadNotifications(allNotifications: Notification[]): number {
    return allNotifications.filter(item => !item.wasRead).length;
  }

  markAsReadAll() {
    const notReadNotifications = this.notifications.filter(item => !item.wasRead);
    this.notifications.forEach(x => x.wasRead = true);

    this.notificationsService.updateAll(notReadNotifications).subscribe(
      () => this.notificationCounter = 0
    );
  }

  markAsRead(id: number): void {
    const notify = this.notifications.find(item => item.id === id);
    notify.wasRead = true;
    this.notificationCounter--;

    this.notificationsService.update(id, notify).subscribe();
  }

  remove(id: number) {
    const index = this.notifications.findIndex(item => item.id === id);

    if (index !== -1) {
      const notification = this.notifications[index];
      if (!notification.wasRead) {
        this.notificationCounter--;
      }
      this.notifications.splice(index, 1);
      this.notificationsHubService.delete(notification);
    }
  }

  redirectToInstance({ instanceId, instanceGuidId }: Notification): void {
    this.router.navigate([`/user/instances/${instanceId}/${instanceGuidId}/dashboards`]);
  }
}
