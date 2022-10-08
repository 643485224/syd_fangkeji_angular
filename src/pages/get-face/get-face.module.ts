import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PipesModule } from '../../pipes/pipes.module';
import { GetFacePage } from './get-face';

@NgModule({
  declarations: [
    GetFacePage,
  ],
  imports: [
    PipesModule,
    IonicPageModule.forChild(GetFacePage),
  ],
})
export class GetFacePageModule {}
