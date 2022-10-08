import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PipesModule } from '../../pipes/pipes.module';
import { OfflinePageModule } from '../offline/offline.module';
import { CheckoutPageModule } from '../checkout/checkout.module';
import { EntryOfflinePage } from './entry-offline';

@NgModule({
  declarations: [
    EntryOfflinePage,
  ],
  imports: [
    PipesModule,
    OfflinePageModule,
    CheckoutPageModule,
    IonicPageModule.forChild(EntryOfflinePage),
  ],
})
export class EntryOfflinePageModule {}
