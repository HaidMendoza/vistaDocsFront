import { Routes } from '@angular/router';
import { LoginComponent } from './components/home/login/login.component';
import { PlantasComponent } from './components/sidevar/components/plantas/plantas.component';
import { SidevarComponent } from './components/sidevar/sidevar.component';
import { InicioComponent } from './components/sidevar/components/inicio/inicio.component';
import { RegistroComponent } from './components/home/registro/registro.component';

// Definición de las rutas de la aplicación
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    
  },
  {
    path: 'registro',
    component: RegistroComponent,
  },
  {
    path: 'sidevar',
    component: SidevarComponent,
    children: [
      { path: 'inicio', component: InicioComponent },

      { path: 'plantas', component: PlantasComponent },

      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
