import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-sidevar',
  imports: [RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl: './sidevar.component.html',
  styleUrl: './sidevar.component.scss'
})
export class SidevarComponent {

}
