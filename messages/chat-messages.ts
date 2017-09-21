import { Component, OnInit, ViewChild, AfterViewChecked, OnDestroy } from '@angular/core';
import { Content, IonicPage, NavParams, NavController } from 'ionic-angular';
import { find } from 'lodash';

import { CurrentUserService } from '../../../../services/current-user/current-user.service';
import { PublicUserService } from '../../../../services/public-user.service';
import { ChatService } from '../../../../services/chat.service';
import { DateHelper } from '../../../../helpers/date.helper';

@IonicPage({
  name: 'chat-messages',
  segment: 'chat',
  priority: 'high',
})
@Component({
  selector: 'dater-chat-messages',
  templateUrl: 'chat-messages.html',
})
export class ChatMessages implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(Content) content: Content;

  chatId: string = '';
  userId: string;
  chatProfile: any = {};
  chatProfileLoaded: boolean = false;
  chat: any;
  chatLenght: number;
  readMessagesSubscribe: any;
  calcMessagesSubscribe: any;
  showEmoji: boolean = false;
  showDislikeButton: boolean = false;

  constructor(
    public currentUser: CurrentUserService,
    private navParams: NavParams,
    private chatService: ChatService,
    private userService: PublicUserService,
    private navController: NavController,
    private dateHelper: DateHelper,
  ) {
    this.chatId = this.navParams.get('chatId');
    this.userId = this.navParams.get('userId');
  }

  ngAfterViewChecked() {
    this.content.scrollToBottom(0);
  }

  subscribeToChat(chatId) {
    this.chat = this.chatService.getChat(chatId);
    this.chat.$ref.once('value')
        .then((chat) => {
          const valueChat = chat.val();
          this.checkShowDislikeButtonOrNot(valueChat);
          this.chatLenght = Object.keys(valueChat).length;
        });

    this.readMessagesSubscribe = this.chatService.readAllNewMessages(chatId);
    this.calcMessagesSubscribe = this.chatService.calcAllNewMessages(chatId);
  }

  checkShowDislikeButtonOrNot(valueChat){
    const res = find(valueChat, (item: any) => {
      return item.sender === this.currentUser.getUID();
    });
    if (!res) {
      this.showDislikeButton = true;
    }
  }

  ngOnDestroy() {
    if (this.readMessagesSubscribe) {
      this.readMessagesSubscribe.unsubscribe();
    }
    if (this.calcMessagesSubscribe) {
      this.calcMessagesSubscribe.unsubscribe();
    }
  }

  async ngOnInit() {
    let companion = this.userId;
    if (this.chatId) {
      companion = await this.chatService.getDialogCompanion(this.chatId);
      this.subscribeToChat(this.chatId);
    }
    this.chatProfile = await this.userService.getUserData(companion);
    this.chatProfile.userUid = companion;
    this.chatProfile.title = this.chatProfile.profile.firstName;
    if (this.chatProfile.profile.birthday) {
      this.chatProfile.title += `, ${this.dateHelper.getAgeByTimestamp(this.chatProfile.profile.birthday)}`;
      this.chatProfileLoaded = true;
    }
  }

  async beginDialog(phrase) {
    const existingChat = await this.chatService.isDialogExist(this.userId);
    if (existingChat !== undefined) {
      this.chatId = existingChat;
      this.chatService.joinChat(this.chatId);
    } else {
      this.chatId = await this.chatService.createDialog(this.userId);
    }
    this.subscribeToChat(this.chatId);
    this.chatService.sendMessage(this.chatId, phrase);
  }

  async onSend(phrase) {
    if (!this.chatId) {
      this.beginDialog(phrase);
    } else {
      this.chatService.sendMessage(this.chatId, phrase);
    }
  }

  wantsToSendMessages(){
    this.showDislikeButton = false;
  }

  dislike(){
    this.showDislikeButton = false;
    this.showEmoji = true;
  }

  closeEmodj(){
    this.showEmoji = false;
    this.showDislikeButton = true;
  }

  deleteChatAndSendEmoji(emojiUrl){
    this.onSend(emojiUrl);
    this.navController.push('chat-index', { deleteChat: true, chatId: this.chatId });
  }

}
