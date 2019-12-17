import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FeedbackComponent } from './feedback/feedback.component';

const userRoutes: Routes = [
  {
    path: '',
    redirectTo: 'instances',
    pathMatch: 'full' // TODO: Write resolver that redirect or just fetch Organization first instance to show dashboards
  },
  { path: 'feedback', component: FeedbackComponent },
  { path: 'instances', loadChildren: () => import('../dashboards/dashboards.module').then(m => m.DashboardsModule) },
  { path: 'settings', loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule) }
];

@NgModule({
  imports: [RouterModule.forChild(userRoutes)],
  exports: [RouterModule]
})
export class UserRoutingModule {
}
