import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidevarComponent } from './components/sidevar/sidevar.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'VistaDoc';
}
