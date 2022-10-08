import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TestPage } from './test';

@NgModule({
  declarations: [
    TestPage,
  ],
  imports: [
    PipesModule,
    IonicPageModule.forChild(TestPage),
  ],
})
export class TestPageModule {}
