import { Component, OnInit } from '@angular/core';
import { NavParams, IonicPage, ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ModalBase } from '../../../../base/modal-base';
import { BackButtonService } from '../../../../../services/back-button.service';

@IonicPage({
  name: 'fail-call',
  segment: 'messages/fail-call',
})
@Component({
  selector: 'dater-fail-call',
  templateUrl: 'fail-call.html',
})
export class FailCall extends ModalBase implements OnInit {

  imgUrl: string;
  title: string = this.translateService.instant('fail-call.title');
  textOnButton: string = this.translateService.instant('fail-call.button-text');
  message: string;
  userName: string;

  constructor(
      public navParams: NavParams,
      private translateService: TranslateService,
      public viewCtrl: ViewController,
      public backButtonService: BackButtonService,
  ) {
    super(viewCtrl, navParams, backButtonService);
  }

  ngOnInit() {
    this.imgUrl = this.navParams.get('imgUrl') || 'assets/img/audio-call.png'; // TODO Должны поступить реальные данные;
    // TODO Должны поступить реальные данные и имя не слогается
    this.userName = this.navParams.get('userName') || 'Настя';
    this.message = this.translateService.instant('fail-call.message', { name: this.userName });
  }
}
