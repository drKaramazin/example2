import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class ChatService {

  public asObservable: FirebaseListObservable<[any]>;
  private currentUserId: string;

  constructor(
    private db: AngularFireDatabase,
  ) {
  }

  objectChat(branch: string, path?: string, options: any = {}): FirebaseObjectObservable<any> {
    if (typeof path === 'object') {
      return this.db.object(`Chat/${branch}`, path);
    } else {
      return this.db.object(`Chat/${branch}` + (path ? `/${path}` : ''), options);
    }
  }

  listChat(branch: string, path?: string, options: any = {}): FirebaseListObservable<any> {
    if (typeof path === 'object') {
      return this.db.list(`Chat/${branch}`, path);
    } else {
      return this.db.list(`Chat/${branch}` + (path ? `/${path}` : ''), options);
    }
  }

  init(userId: string): void {
    this.currentUserId = userId;
    this.asObservable = this.asObservable = this.listChat('Rooms', this.currentUserId, {
      query: {
        orderByChild: 'isActive',
        equalTo: true,
      },
    });
  }

  async createDialog(userId: string): Promise<string> {
    const chatMembers = {};
    chatMembers[userId] = true;
    chatMembers[this.currentUserId] = true;

    return await this.listChat('Members').push({
      members: chatMembers,
      isGroup: false,
      created: firebase.database.ServerValue.TIMESTAMP,
      owner: this.currentUserId,
    }).then((newChat) => {

      // Создаем комнаты с начальными данными:
      this.objectChat('Rooms', `${this.currentUserId}/${newChat.key}`).update({
        messagesCount: 0,
        readMessagesCount: 0,
        ownMessagesCount: 0,
        isActive: true,
        isGroup: false,
        created: firebase.database.ServerValue.TIMESTAMP,
        owner: this.currentUserId,
        companion: userId,
      });
      this.objectChat('Rooms', `${userId}/${newChat.key}`).update({
        messagesCount: 0,
        readMessagesCount: 0,
        ownMessagesCount: 0,
        isActive: true,
        isGroup: false,
        created: firebase.database.ServerValue.TIMESTAMP,
        owner: this.currentUserId,
        companion: this.currentUserId,
      });

      // Заполняем список собеседников пользователей:
      let companions = {};
      companions[userId] = firebase.database.ServerValue.TIMESTAMP;
      this.objectChat('Companions', this.currentUserId).update(companions);
      companions = {};
      companions[this.currentUserId] = firebase.database.ServerValue.TIMESTAMP;
      this.objectChat('Companions', userId).update(companions);

      return newChat.key;
    });
  }

  async getDialogCompanion(dialogId: string): Promise<string> {
    return await this.objectChat('Members', `${dialogId}/members`)
      .$ref
      .once('value')
      .then((members) => {
        let companion;
        for (const member in members.val()) {
          if (member !== this.currentUserId) {
            companion = member;
            break;
          }
        }
        return companion;
      });
  }

  getChat(chatId: string): FirebaseListObservable<object[]> {
    return this.listChat('Messages', chatId, {
      query: {
        orderByValue: 'timestamp',
      },
    });
  }

  readAllNewMessages(chatId: string): Subscription {
    return this.listChat('Messages', chatId, {
      query: {
        orderByChild: 'isRead',
        equalTo: false,
      },
    }).subscribe((snapshot) => {
      for (const message of snapshot) {
        if (message.sender !== this.currentUserId) {
          this.objectChat('Messages', `${chatId}/${message.$key}`).update({
            isRead: true,
          });
        }
      }
    });
  }

  calcAllNewMessages(chatId: string): Subscription {
    return this.objectChat('Rooms', `${this.currentUserId}/${chatId}`).subscribe((room) => {
      const newReadMessages = room.messagesCount - room.ownMessagesCount;
      if (room.readMessagesCount !== newReadMessages) {
        this.objectChat('Rooms', `${this.currentUserId}/${chatId}`).update({
          readMessagesCount: newReadMessages,
        });
      }
    });
  }

  async isDialogExist(userId: string): Promise<string> {
    return await this.listChat('Rooms', `${this.currentUserId}`)
      .$ref.once('value')
      .then((snapshot) => {
        const chats = snapshot.val();
        let existingChat = undefined;
        if (chats) {
          for (const chatId in chats) {
            if (userId === chats[chatId].companion) {
              existingChat = chatId;
              break;
            }
          }
        }

        return existingChat;
      });
  }

  joinChat(chatId: string): void {
    const members = {};
    members[this.currentUserId] = true;
    this.objectChat('Members', `${chatId}/members`).update(members);
    this.objectChat('Rooms', `${this.currentUserId}/${chatId}`).update({
      isActive: true,
    });
  }

  async getChatMembers(chatId): Promise<any>{
    return await this.db.object(`Chat/Members/${chatId}/members`)
      .$ref
      .once('value')
      .then((res) => {
        const members = res.val();
        const m: any = [];
        for (const memberId in members) {
          m[memberId] = members[memberId];
        }
        return m;
      });

  }

  leaveChat(chatId: string): void {
    const members = {};
    members[this.currentUserId] = false;
    this.objectChat('Members', `${chatId}/members`).update(members);
    this.objectChat('Rooms', `${this.currentUserId}/${chatId}`).update({
      isActive: false,
    });
  }

  private sendMessageTransaction(userId, chatId, messagePhrase, own: boolean, timestamp: object | number): void {
    this.objectChat('Rooms', `${userId}/${chatId}`)
      .$ref
      .transaction((room) => {
        if (room) {
          room.lastPhrase = messagePhrase;
          room.lastPhraseAdded = timestamp;
          room.messagesCount += 1;
          if (own) {
            room.ownMessagesCount += 1;
          }
        }

        return room;
      });
  }

  async sendMessage(chatId: string, messagePhrase: string): Promise<void> {
    const trimMessagePhrase = messagePhrase.trim();
    if (trimMessagePhrase.length === 0) {
      return;
    } else {
      const lastPhraseAdded = firebase.database.ServerValue.TIMESTAMP;
      this.listChat('Messages', chatId).push({
        phrase: trimMessagePhrase,
        timestamp: lastPhraseAdded,
        sender: this.currentUserId,
        isRead: false,
      });

      const companion = await this.getDialogCompanion(chatId);

      this.sendMessageTransaction(this.currentUserId, chatId, messagePhrase, true, lastPhraseAdded);
      this.sendMessageTransaction(companion, chatId, messagePhrase, false, lastPhraseAdded);
    }
  }
}
