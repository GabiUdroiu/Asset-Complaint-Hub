import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout';
import { authGuard, adminGuard, responsibleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        title: 'Asset Complaint Hub - Login',
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
    },
    {
        title: 'Asset Complaint Hub - Register',
        path: 'register',
        loadComponent: () =>
            import('./features/auth/register/register').then((m) => m.RegisterComponent),
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                title: 'Asset Complaint Hub - Home',
                path: 'home',
                loadComponent: () =>
                    import('./features/home-page/home').then((m) => m.HomePageComponent),
            },
            {
                title: 'Asset Complaint Hub - Assets',
                path: 'assets',
                loadComponent: () =>
                    import('./features/assets/assets').then((m) => m.AssetsComponent),
            },
            {
                title: 'Asset Complaint Hub - Requests',
                path: 'requests',
                loadComponent: () =>
                    import('./features/requests/requests').then((m) => m.RequestsComponent),
            },
            {
                title: 'Asset Complaint Hub - Complaints',
                path: 'complaints',
                loadComponent: () =>
                    import('./features/complaints/complaints').then((m) => m.ComplaintsComponent),
            },
            {
                title: 'Asset Complaint Hub - Complaint Details',
                path: 'complaints/:id',
                loadComponent: () =>
                    import('./features/complaints/complaint-detail/complaint-detail').then(
                        (m) => m.ComplaintDetailComponent,
                    ),
            },
            {
                title: 'Asset Complaint Hub - Request Details',
                path: 'requests/:id',
                loadComponent: () =>
                    import('./features/requests/request-detail/request-detail').then(
                        (m) => m.RequestDetailComponent,
                    ),
            },
            {
                title: 'Asset Complaint Hub - Admin Dashboard',
                path: 'admin',
                canActivate: [adminGuard],
                loadComponent: () =>
                    import('./features/admin/admin-dashboard/admin-dashboard').then(
                        (m) => m.AdminDashboardComponent,
                    ),
            },
            {
                path: '**',
                redirectTo: 'home',
            },
        ],
    },
];
