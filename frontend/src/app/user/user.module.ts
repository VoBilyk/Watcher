import { NgModule } from '@angular/core';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { FeedbackComponent } from '../feedback/feedback.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    UserRoutingModule,
  ],
  declarations: [ UserComponent, FeedbackComponent ]
})
export class UserModule { }
