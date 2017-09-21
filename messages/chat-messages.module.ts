import { NgModule } from '@angular/core';
import { IonicModule, IonicPageModule } from 'ionic-angular';

import { ScreenModule } from '../../../screen.module';
import { SharedModule } from '../../../../shared/shared.module';
import { ChatMessages } from './chat-messages';


@NgModule({
  imports: [
    IonicModule,
    ScreenModule,
    SharedModule,
    IonicPageModule.forChild(ChatMessages),
  ],
  exports: [ChatMessages],
  declarations: [ChatMessages],
  entryComponents: [ChatMessages],
  providers: [],
})
export class ChatMessagesModule { }
