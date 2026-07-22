import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Sidebar, Header],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {}
