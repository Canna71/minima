import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { LoggedInGuard } from '../services/logged-in.guard';
import { UserService } from '../services/user';

import { MainComponent } from './UI/main/main.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
   {
    path: 'main',
    component: MainComponent,
    
  },
 {
    path: 'main/:path',
    component: MainComponent,
    
  },
];


@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot( routes, { useHash: true } ),
  ],
  providers: [   ],
  declarations: [  ],
  exports: [
    RouterModule
  ],
})

export class AppRoutingModule {}
