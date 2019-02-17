import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { UserListComponent } from './user-list/user-list.component';
import { FeedbackListComponent } from './feedback-list/feedback-list.component';
import { DataCollectorComponent } from './data-collector/data-collector.component';

const routes: Routes = [{
  path: '',
  children: [{
    path: '',
    children: [
      { path: 'organization-list', component: OrganizationListComponent },
      { path: 'user-list', component: UserListComponent },
      { path: 'feedback-list', component: FeedbackListComponent },
      { path: 'data-collector-apps', component: DataCollectorComponent }
    ]
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
