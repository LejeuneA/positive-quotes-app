import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesComponent } from './components/categories/categories.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
    data: { fullBackground: false },
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: { fullBackground: false },
  },
  {
    path: 'categories',
    component: CategoriesComponent,
    canActivate: [AuthGuard],
    data: { fullBackground: true },
  },

  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
    data: { fullBackground: true },
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { fullBackground: true },
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { fullBackground: true },
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
    data: { fullBackground: false },
  },
  {
    path: '**',
    redirectTo: 'home',
    data: { fullBackground: false },
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
