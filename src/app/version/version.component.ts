import { Component } from '@angular/core';
import * as packageJson from '../../../package.json';

@Component({
  selector: 'app-version',
  template: '<div class="version-container">Version {{version}}</div>',
  styles: [
    `
      .version-container {
        display: inline-block;
        margin: 10px;
        padding: 5px 10px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        border-radius: 5px;
        font-size: 0.8em;
      }
    `,
  ],
})
export class VersionComponent {
  version: string = (packageJson as any).default.version;
}
