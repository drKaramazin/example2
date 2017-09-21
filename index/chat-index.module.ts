import { NgModule } from '@angular/core';
import { IonicModule, IonicPageModule } from 'ionic-angular';

import { ScreenModule } from '../../../screen.module';
import { SharedModule } from '../../../../shared/shared.module';
import { ChatIndex } from './chat-index';


@NgModule({
  imports: [
    IonicModule,
    ScreenModule,
    SharedModule,
    IonicPageModule.forChild(ChatIndex),
  ],
  exports: [ChatIndex],
  declarations: [ChatIndex],
  entryComponents: [ChatIndex],
  providers: [],
})
export class ChatIndexModule { }
