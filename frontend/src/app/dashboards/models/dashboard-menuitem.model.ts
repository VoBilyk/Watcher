import {DashboardChart} from './dashboard-chart';
import { MenuItem } from 'primeng/api/menuitem';

export interface DashboardMenuItem extends MenuItem  {
    dashId?: number;
    createdAt?: Date;
    charts?: DashboardChart[];
}
