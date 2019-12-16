import { Component } from '@angular/core';
import { ChatService } from '../../core/services/chat.service';
import { NotificationType } from '../../shared/models/notification-type.enum';

@Component({
  selector: 'app-system-notification',
  templateUrl: './system-notification.component.html',
  styleUrls: ['./system-notification.component.sass']
})
export class SystemNotificationComponent {

  constructor(private chatService: ChatService) { }
  type = NotificationType;

  openChat(id: number) {
    this.chatService.openChatClick.next(id);
  }
}
