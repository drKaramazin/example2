import { Component, OnInit } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ChatService } from '../../../../../services/chat.service';
import { PublicUserService } from '../../../../../services/public-user.service';
import { User } from 'dater-models';


@IonicPage({
  name: 'goodbye',
  segment: 'messages/goodbye',
})
@Component({
  selector: 'dater-goodbye',
  templateUrl: 'goodbye.html',
})
export class Goodbye implements OnInit {

  title: string;
  message: string = this.translateService.instant('googbye.mesage');
  imgUrl: string;
  userName: string;
  gender: string;
  chatId: string;
  emojiUrl: string;

  constructor(
      private navParams: NavParams,
      private translateService: TranslateService,
      private chatService: ChatService,
      private publicUserService: PublicUserService,
  ) {

  }


  async ngOnInit() {
    this.userName = this.navParams.get('userName');
    this.title = `${this.navParams.get('userName')} ${this.message}`;
    this.imgUrl = this.navParams.get('imgUrl');
    this.chatId = this.navParams.get('chatId');
    this.emojiUrl = this.navParams.get('emojiUrl');
    // TODO Этот способ не будет работать если чат будет груповым, чтобы не сломать нужно написать тест
    const userId = await this.chatService.getDialogCompanion(this.chatId);
    const user: User = await this.publicUserService.getUserData(userId);
    this.gender = user.profile.gender;
  }

  goToChat(){
    const currentTabs = document.getElementsByClassName('tabbar')[0];
    currentTabs.getElementsByTagName('a')[1].click();
  }

}
