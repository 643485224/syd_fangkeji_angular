import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PipesModule } from '../../pipes/pipes.module';
import { ComponentsModule } from '../../components/components.module';
import { OnsitePage } from './onsite';
import { Onsite2Page } from './onsite2';
import { Onsite3Page } from './onsite3';
import { Onsite4Page } from './onsite4';
import { Onsite5Page } from './onsite5';

@NgModule({
  declarations: [
    OnsitePage,
    Onsite2Page,
    Onsite3Page,
    Onsite4Page,
    Onsite5Page,
  ],
  entryComponents: [
    Onsite2Page,
    Onsite3Page,
    Onsite4Page,
    Onsite5Page,
  ],
  imports: [
    PipesModule,
    ComponentsModule,
    IonicPageModule.forChild(OnsitePage),
  ],
})
export class OnsitePageModule {}
