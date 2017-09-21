import { NgModule } from '@angular/core';
import { IonicModule, IonicPageModule } from 'ionic-angular';

import { ScreenModule } from '../../../../screen.module';
import { SharedModule } from '../../../../../shared/shared.module';
import { AudioCall } from './audio-call';


@NgModule({
  imports: [
    IonicModule,
    ScreenModule,
    SharedModule,
    IonicPageModule.forChild(AudioCall),
  ],
  exports: [AudioCall],
  declarations: [AudioCall],
  entryComponents: [AudioCall],
  providers: [],
})
export class ChatMessagesModule { }
