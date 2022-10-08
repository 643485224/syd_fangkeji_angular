import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WelcomePage } from './welcome';
import { PipesModule } from '../../pipes/pipes.module';
import { FirstSettingPageModule } from '../first-setting/first-setting.module';

@NgModule({
  declarations: [
    WelcomePage,
  ],
  imports: [
    PipesModule,
    FirstSettingPageModule,
    IonicPageModule.forChild(WelcomePage),
  ],
})
export class WelcomePageModule {}
