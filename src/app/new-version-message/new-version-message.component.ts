import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-new-version-message',
  templateUrl: './new-version-message.component.html',
  styleUrls: ['./new-version-message.component.scss']
})
export class NewVersionMessageComponent implements OnInit{

  newUpdate: boolean = true;

  ngOnInit(): void {
    setTimeout(() => {
      this.hideUpdate();
    },5000);
  }

  showUpdate() {
    this.newUpdate = true;
  }

  hideUpdate() {
    this.newUpdate = false;
  }

}
