import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  Popover,
  PopoverController
} from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import { FirstSettingPage } from '../first-setting/first-setting';

@IonicPage()
@Component({
  selector: "page-welcome",
  templateUrl: "welcome.html"
})
export class WelcomePage {
  

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public popCtrl: PopoverController,
    public globalSvr: GlobalProvider
  ) {}

  ionViewWillLoad() {
    
  }

  protected onSetting() {
    let popover: Popover = this.popCtrl.create(
      FirstSettingPage,
      { },
      {
        enableBackdropDismiss: false
      }
    );

    popover.present();

    popover.onDidDismiss((data: any, role: string) => {
      this.globalSvr.sendMessage(1, 0);
    });
  }
}
