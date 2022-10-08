import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EnterPwdPage } from './enter-pwd';

@NgModule({
  declarations: [
    EnterPwdPage,
  ],
  imports: [
    IonicPageModule.forChild(EnterPwdPage),
  ],
})
export class EnterPwdPageModule {}
