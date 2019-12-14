import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { ChatComponent } from './chat.component';
import { ConversationPanelComponent } from './conversation-panel/conversation-panel.component';
import { ConversationSettingsPopupComponent } from './conversation-settings-popup/conversation-settings-popup.component';
import { ChatCreatePopupComponent } from './chat-create-popup/chat-create-popup.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ChatComponent,
    ConversationPanelComponent,
    ConversationSettingsPopupComponent,
    ChatCreatePopupComponent
  ],
  exports: [ChatComponent]
})
export class ChatModule { }
