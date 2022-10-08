import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckoutPage } from './checkout';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    CheckoutPage,
  ],
  imports: [
    PipesModule,
    IonicPageModule.forChild(CheckoutPage),
  ],
})
export class CheckoutPageModule {}
