import { Component } from "@angular/core";
import { NativeApiProvider } from "../../providers/native-api/native-api";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from "ionic-angular";

@IonicPage()
@Component({
  selector: "page-first-setting",
  templateUrl: "first-setting.html"
})
export class FirstSettingPage {
  protected step: number = 1;
  protected title: string = "设置管理密码";
  protected prompt: string = "";
  protected clr1: string = "primary";
  protected clr2: string = "dark";
  protected clr3: string = "dark";
  protected pwd1: string = "";
  protected pwd2: string = "";
  protected ip: string = "";
  protected port: string = "";
  protected regcode: string = "";
  protected keyMode: number = 0;
  protected time: string = "3";
  private focused: number = 1;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public nativeApi: NativeApiProvider
  ) { }

  ionViewDidLoad() {
    console.log("ionViewDidLoad FirstSettingPage");
  }

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
  }

  private setPrompt(text: string) {
    this.prompt = text;
  }

  private setStep(id: number) {
    switch (id) {
      case 2:
        this.prompt = "";
        this.title = "设置平台参数";
        this.onTextClick(3);
        break;
      case 3:
        {
          let timer: number;
          let count: number = 3;

          this.prompt = "";
          this.title = "设置完成";

          timer = window.setInterval(() => {
            count--;
            this.time = count.toString();

            if (count <= 0) {
              window.clearInterval(timer);
              this.viewCtrl.dismiss();
            }
          }, 1000);
        }
        break;
    }

    this.step = id;
  }

  protected onClose(event: any) {
    this.viewCtrl.dismiss(false);
  }

  protected onTextClick(id: number) {
    switch (id) {
      case 1:
        this.clr1 = "primary";
        this.clr2 = "dark";
        this.clr3 = "dark";
        this.keyMode = 0;
        break;
      case 2:
        this.clr1 = "dark";
        this.clr2 = "primary";
        this.clr3 = "dark";
        this.keyMode = 0;
        break;
      case 3:
        this.clr1 = "primary";
        this.clr2 = "dark";
        this.clr3 = "dark";
        this.keyMode = 1;
        break;
      case 4:
        this.clr1 = "dark";
        this.clr2 = "primary";
        this.clr3 = "dark";
        this.keyMode = 0;
        break;
      case 5:
        this.clr1 = "dark";
        this.clr2 = "dark";
        this.clr3 = "primary";
        this.keyMode = 0;
        break;
    }

    this.focused = id;
  }

  protected onNumDown(char: string) {
    switch (this.focused) {
      case 1:
        if (this.pwd1.length < 8) this.pwd1 += char;
        break;
      case 2:
        if (this.pwd2.length < 8) this.pwd2 += char;
        break;
      case 3:
        if (this.ip.length < 15) this.ip += char;
        break;
      case 4:
        if (this.port.length < 5) this.port += char;
        break;
      case 5:
        if (this.regcode.length < 14) this.regcode += char;
        break;
    }
  }

  protected onConfirm(id: number) {
    switch (id) {
      case 1: {
        let hash: string;

        if (this.pwd1.length === 0) {
          this.setPrompt("密码不能为空!");
          return;
        }

        if (this.pwd1 !== this.pwd2) {
          this.setPrompt("两次输入的密码不一致!");
          return;
        }

        if (window.$native) {
          hash = window.$native.sha256b64(this.pwd1);
        } else {
          hash = this.pwd1;
        }

        this.nativeApi.setConfig("passwd", hash);
        this.nativeApi.setConfig("init", "1");
        this.nativeApi.setConfig("offline", String(true));
        this.setStep(2);
      }
        break;

      case 2:
        if (this.ip) this.nativeApi.setConfig("ip", this.ip);
        if (this.port) this.nativeApi.setConfig("port", this.port);
        if (this.regcode) this.nativeApi.setConfig("regcode", this.regcode);
        this.setStep(3);
        break;
    }
  }

  protected onBackspace() {
    switch (this.focused) {
      case 1:
        if (this.pwd1.length) {
          this.pwd1 = this.pwd1.substring(0, this.pwd1.length - 1);
        }
        break;
      case 2:
        if (this.pwd2.length) {
          this.pwd2 = this.pwd2.substring(0, this.pwd2.length - 1);
        }
        break;
      case 3:
        if (this.ip.length) {
          this.ip = this.ip.substring(0, this.ip.length - 1);
        }
        break;
      case 4:
        if (this.port.length) {
          this.port = this.port.substring(0, this.port.length - 1);
        }
        break;
      case 5:
        if (this.regcode.length) {
          this.regcode = this.regcode.substring(0, this.regcode.length - 1);
        }
        break;
    }
  }

  protected onClean() {
    switch (this.focused) {
      case 1:
        this.pwd1 = "";
        break;
      case 2:
        this.pwd2 = "";
        break;
      case 3:
        this.ip = "";
        break;
      case 4:
        this.port = "";
        break;
      case 5:
        this.regcode = "";
        break;
    }
  }
}
