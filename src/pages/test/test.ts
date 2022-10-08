import { GlobalProvider } from "./../../providers/global/global";
import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";

@IonicPage({
  segment: "test"
})
@Component({
  selector: "page-test",
  templateUrl: "test.html"
})
export class TestPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad TestPage");
  }


  /*
  public Base64(val) {

  }

  public AES128_CBC(val, val2) {

  }

  public test() {
    let RegCode;
    let PoolCode;
    let encKey, encField;

    RegCode = "123456";
    PoolCode = this.Base64(RegCode + ":" + "11-22-33-44-55-66");
    //PoolCode = "MTIzNDU2OjExLTIyLTMzLTQ0LTU1LTY2"



    RegCode = this.Base64(this.AES128_CBC("123456", "dahua"));
    //RegCode = "tXzMJB8RMfrs5mgOWQeTZQ=="
    PoolCode = this.Base64(RegCode + ":" + "11-22-33-44-55-66");
    //PoolCode = "dFh6TUpCOFJNZnJzNW1nT1dRZVRaUT09OjExLTIyLTMzLTQ0LTU1LTY2"

    encKey = "123456" + "2" + "dahua";
    encKey = "1234562dahua";

    encField = this.Base64(this.AES128_CBC("E2018752182", encKey));
    //encFiele = "i/TpjdGNXgKGQVVG5/P7YA=="
  }
  */

}
