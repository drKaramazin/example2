import { Component, OnInit } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
import { ModalBase } from '../../../../base/modal-base';
import { BackButtonService } from '../../../../../services/back-button.service';
import { User } from 'dater-models';

@IonicPage({
  name: 'audio-call',
  segment: 'messages/audio/call',
})
@Component({
  selector: 'dater-audio-call',
  templateUrl: 'audio-call.html',
})
export class AudioCall extends ModalBase implements OnInit {

  userInterlocutor: User;

  constructor(
      public viewCtrl: ViewController,
      public navParams: NavParams,
      public backButtonService: BackButtonService,
  ) {
    super(viewCtrl, navParams, backButtonService);
  }

  ngOnInit() {
    this.userInterlocutor = this.navParams.get('user');
  }

}
