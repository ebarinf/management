import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  readonly title = signal('');
}
