import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import {
  InputTextModule,
  ButtonModule,
  DialogModule,
  CardModule,
  ListboxModule,
  AccordionModule,
  AutoCompleteModule,
  TooltipModule,
  InputSwitchModule,
  ProgressSpinnerModule,
} from 'primeng/primeng';

import { ChatComponent } from './chat.component';
import { ConversationPanelComponent } from './conversation-panel/conversation-panel.component';
import { ConversationSettingsPopupComponent } from './conversation-settings-popup/conversation-settings-popup.component';
import { ChatCreatePopupComponent } from './chat-create-popup/chat-create-popup.component';

@NgModule({
  imports: [
    SharedModule,
    AccordionModule,
    InputTextModule,
    CardModule,
    ButtonModule,
    ListboxModule,
    DialogModule,
    AutoCompleteModule,
    TooltipModule,
    InputSwitchModule,
    ProgressSpinnerModule
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
