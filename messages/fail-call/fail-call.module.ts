import { NgModule } from '@angular/core';
import { IonicPageModule, IonicModule } from 'ionic-angular';

import { FailCall } from './fail-call';
import { ScreenModule } from '../../../../screen.module';
import { SharedModule } from '../../../../../shared/shared.module';

@NgModule({
  imports: [
    IonicPageModule.forChild(FailCall),
    IonicModule,
    ScreenModule,
    SharedModule,
  ],
  exports: [
    FailCall,
  ],
  declarations: [
    FailCall,
  ],
  entryComponents: [
    FailCall,
  ],
  providers: [],
})
export class FailCallModule {
}
