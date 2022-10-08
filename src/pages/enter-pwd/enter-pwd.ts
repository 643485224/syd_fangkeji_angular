import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";

@IonicPage()
@Component({
  selector: "page-enter-pwd",
  templateUrl: "enter-pwd.html"
})
export class EnterPwdPage {
  protected title: string = "";
  protected prompt: string = "";
  protected clr1: string = "primary";
  protected clr2: string = "dark";
  protected pwd1: string = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public globalSvr: GlobalProvider
  ) {}

  ionViewDidLoad() {}

  ionViewWillEnter() {
    let element: HTMLElement = this.viewCtrl.getIONContentRef().nativeElement;

    while (element) {
      if (element.classList.contains("popover-md")) {
        let list = element.getElementsByTagName("ion-backdrop");
        let elem: HTMLElement;

        if (list.length) {
          elem = <HTMLElement>list.item(0);
          elem.style.opacity = "0.6";
        }

        break;
      }

      element = element.parentElement;
    }

    this.title = `请输入管理密码`;
  }

  private setPrompt(text: string) {
    this.prompt = text;
  }

  protected onTextClick(id: number) {
    this.clr1 = "primary";
  }

  protected onClose(event: any) {
    this.viewCtrl.dismiss(false);
  }

  protected onConfirm() {
    if (this.pwd1.length === 0) {
      this.setPrompt("密码不能为空!");
      return;
    }

    this.viewCtrl.dismiss(this.pwd1);
  }

  protected onNumDown(char: string) {
    if (this.pwd1.length < 8) {
      this.pwd1 += char;
    }
  }

  protected onBackspace() {
    if (this.pwd1.length) {
      this.pwd1 = this.pwd1.substring(0, this.pwd1.length - 1);
    }
  }

  protected onClean() {
    this.pwd1 = "";
  }
}
