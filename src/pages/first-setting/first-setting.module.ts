import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FirstSettingPage } from './first-setting';

@NgModule({
  declarations: [
    FirstSettingPage,
  ],
  imports: [
    IonicPageModule.forChild(FirstSettingPage),
  ],
})
export class FirstSettingPageModule {}
