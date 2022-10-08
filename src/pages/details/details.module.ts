import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetailsPage } from './details';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    DetailsPage,
  ],
  imports: [
    PipesModule,
    IonicPageModule.forChild(DetailsPage),
  ],
})
export class DetailsPageModule {}
