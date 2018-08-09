import { Component, OnInit } from '@angular/core';
import { NotificationSetting } from '../../shared/models/notificationSetting';
import { NotificationSettingsService } from '../../core/services/notification-settings.service';
import {SelectItem} from 'primeng/api';
// import { ToastnotificationService } from '../../core/services/toastnotification.service';
import { NotificationType } from '../../shared/models/notification-type.enum';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.sass']
})
export class NotificationSettingsComponent implements OnInit {
  dropdown: SelectItem[];
  notificationSettings: NotificationSetting[];
  selectedNotificationSetting: NotificationSetting;


  constructor(private service: NotificationSettingsService) {
    this.dropdown = new Array<SelectItem>();
    this.notificationSettings = this.service.getNotificationSettings(1); // send userId
    this.selectedNotificationSetting = this.notificationSettings[0];
    this.fillDropdown(this.notificationSettings);
  }

  ngOnInit() {

  }

  onSubmit() {
  }

  private fillDropdown(notificationSettings: NotificationSetting[]) {
    notificationSettings.forEach(element => {
      this.dropdown.push({label: NotificationType[element.type], value: element});
    });
  }

  saveSetting() {
    if (this.selectedNotificationSetting && this.selectedNotificationSetting.isDisable) {
      // this.toastnotificationService.confirm("Are you sure you want to disable all notifications?").the
      // this.toastnotificationService.success('oK!');
    }

    // tslint:disable-next-line:no-debugger
    debugger;
  }


}
