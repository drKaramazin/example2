import { NgModule } from '@angular/core';
import { IonicModule, IonicPageModule } from 'ionic-angular';

import { ScreenModule } from '../../../../screen.module';
import { SharedModule } from '../../../../../shared/shared.module';
import { Goodbye } from './goodbye';


@NgModule({
  imports: [
    IonicModule,
    ScreenModule,
    SharedModule,
    IonicPageModule.forChild(Goodbye),
  ],
  exports: [Goodbye],
  declarations: [Goodbye],
  entryComponents: [Goodbye],
  providers: [],
})
export class GoodbyeModule { }
