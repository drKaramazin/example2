import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { CurrentUserService } from '../../../../services/current-user/current-user.service';
import { PublicUserService } from '../../../../services/public-user.service';
import { ChatService } from '../../../../services/chat.service';

@IonicPage({
  name: 'chat-index',
  segment: 'chat',
  priority: 'high',
})
@Component({
  selector: 'dater-chat-index',
  templateUrl: 'chat-index.html',
})
export class ChatIndex {

  countChatItems: number = 0;
  private chats: any;
  private chatsSubscribe: any;
  private totalUnreadMessagesCount = 0;


  constructor(
    public currentUser: CurrentUserService,
    private navCtrl: NavController,
    private chatService: ChatService,
    private userService: PublicUserService,
    private navParams: NavParams,

  ) {
  }

  ionViewWillEnter() {
    const deleteChat: boolean = this.navParams.get('deleteChat');
    if (deleteChat){
      const chatId = this.navParams.get('chatId');
      this.leaveChat(chatId);
    }

    this.chatsSubscribe = this.chatService.asObservable.subscribe((chats) => {
      this.countChatItems = chats.length;
      this.collectChats(chats);
    });
  }

  async collectChats(anyChats: any) {
    const chats: any = this.chatSort(anyChats);
    const { totalUnreadMessagesCount, chats : chatsWithInformation } = await this.getInformationAboutCompanion(chats);
    this.totalUnreadMessagesCount = totalUnreadMessagesCount;
    this.chats = chatsWithInformation;
    this.countChatItems = 0;
  }

  chatSort(chats): any {
    return chats.sort((a, b) => {
      if (a.lastPhraseAdded < b.lastPhraseAdded) {
        return 1;
      }
      if (a.lastPhraseAdded > b.lastPhraseAdded) {
        return -1;
      }
      return 0;
    });
  }

  async getInformationAboutCompanion(chats: any): Promise<any>{
    let totalUnreadMessagesCount = 0;
    for (const chat of chats) {
      const isChatHasToMembers = await this.getChatHasMember(chat);
      if (!isChatHasToMembers) {
        chat.isLastMessage = !isChatHasToMembers;
      } else {
        chat.isLastMessage = false;
      }
      const companion = await this.chatService.getDialogCompanion(chat.$key);
      const profile = await this.userService.getProfile(companion);
      const mainPhoto = await this.userService.getMainPhoto(companion);
      chat.title = profile.firstName;
      chat.imgUrl = mainPhoto['size150x150'];
      chat.mainPhoto = mainPhoto;
      chat.unreadMessagesCount = chat.messagesCount - chat.ownMessagesCount - chat.readMessagesCount;
      totalUnreadMessagesCount += chat.unreadMessagesCount;
    }
    return { totalUnreadMessagesCount, chats };
  }

  async getChatHasMember(chat){
    const chatId = chat.$key;
    const chatMembers = await this.chatService.getChatMembers(chatId);
    const currentUserUid = this.currentUser.getUID();
    let value: boolean;
    for (const item in chatMembers){
      if (item !== currentUserUid){
        value = chatMembers[item];
        break;
      }
    }
    return value;
  }

  openChatMessages (id: string, chat){
    if (chat.isLastMessage){
      this.goGoodbye(chat);
    } else {
      this.navCtrl.push('chat-messages', { chatId: id });
    }
  }

  leaveChat(chatId: string) {
    this.chatService.leaveChat(chatId);
  }

  onCreateDialog(id: string) {
    this.navCtrl.push('chat-messages', { userId: id });
  }

  ionViewDidLeave() {
    if (this.chatsSubscribe) {
      this.chatsSubscribe.unsubscribe();
    }
  }

  goGoodbye(chat){
    const imgUrl = chat.mainPhoto['size600x800'];
    const userName = chat.title;
    const chatId = chat.$key;
    const emojiUrl = chat.lastPhrase;
    this.navCtrl.push('goodbye', { imgUrl, userName, chatId, emojiUrl });
  }

}
