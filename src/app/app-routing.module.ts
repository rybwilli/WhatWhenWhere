import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OccasionListComponent } from './components/occasion-list/occasion-list.component';
import { CreateOccasionComponent } from './components/create-occasion/create-occasion.component';
import { OccasionDetailComponent } from './components/occasion-detail/occasion-detail.component';
import { FinalizeOccasionComponent } from './components/finalize-occasion/finalize-occasion.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: OccasionListComponent, canActivate: [AuthGuard] },
  { path: 'occasion/new', component: CreateOccasionComponent, canActivate: [AuthGuard] },
  { path: 'occasion/:id', component: OccasionDetailComponent, canActivate: [AuthGuard] },
  { path: 'occasion/:id/finalize', component: FinalizeOccasionComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
