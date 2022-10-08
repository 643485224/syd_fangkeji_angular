import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Subscription } from "rxjs";
import { GlobalProvider } from "../../providers/global/global";
import {
  NativeApiProvider,
  IdCardInfo,
  TaskCode,
  TaskResult,
  OcrResult,
  OcrPpInfo,
  ReadPpResult,
  OcrIdcardInfo,
  OcrDrivingCardInfo,
  ReadPpRequest,
  InvsCardResponse
} from "../../providers/native-api/native-api";
import { Offline2Page } from "./offline2";
import { Offline4Page } from "./offline4";
import { sleep } from "../../app/common";

/**
 * 离线访客登记主页面
 */
@IonicPage()
@Component({
  selector: "page-offline",
  templateUrl: "offline.html"
})
export class OfflinePage {  // 选择证件类型页面
  private subIdcard: Subscription = null;
  private idcard: IdCardInfo = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeSvr: NativeApiProvider
  ) { }

  ionViewDidEnter() { //一进入页面触发该方法
    this.globalSvr.offline.reset();
    this.setHandler();
  }

  ionViewDidLeave() {//离开页面触发该方法
    this.idcard = null;
    this.cleanHandler();
  }

  private setHandler() {
    this.subIdcard = this.nativeSvr
      .subscribe_IdCard()
      .subscribe((data: IdCardInfo) => {
        if (data == null) return;

        this.idcard = data;

        let now = new Date();
        let nowNumber = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + (now.getDate());
        let expire = this.idcard.Expire;
        if (parseInt(expire) < nowNumber) {
          this.globalSvr.showAlert("警告", "身份证过期");
        }

        this.globalSvr.offline.mode = 4;
        this.globalSvr.offline.idcard = data;
        this.globalSvr.offline.b64head = data.Head;

        this.navCtrl.push(Offline2Page);
      });
  }

  private cleanHandler() {
    if (this.subIdcard) {
      this.subIdcard.unsubscribe();
      this.subIdcard = null;
    }
  }

  protected onOcrClick(event: any, type: number) {//点击无证登记按钮调用该方法并接收参数"6"
    if (type == 6) {    // 无证登记
      this.navCtrl.push(Offline2Page); // 跳转访客登记 - 确认访客信息页面
      this.globalSvr.offline.mode = type;
      return;
    }

    this.globalSvr.showLoading("OCR识别证件中...");

    window.setTimeout(async () => {
      try {
        let result: TaskResult;
        let ocrResult: OcrResult;
        let idResult: OcrIdcardInfo;
        let ppResult: OcrPpInfo;
        let dcResult: OcrDrivingCardInfo;

        if (type === 4) {
          this.globalSvr.showLoading("请将IC卡放置于操作区域...");


          try {
            let start: number = Date.now();
            let resp: InvsCardResponse | null;
            let cardNo: string = "00000000";

            await this.nativeSvr.SetIdReaderPause(true);

            do {
              await sleep(200);

              resp = await this.nativeSvr.ICO_FindCard_REQA(2000);
              if (!resp) continue;
              console.log("ICO_FindCard_REQA", resp);
              if (resp.sw3 !== 0x90) continue;

              if (resp.data && resp.data.length >= 4) {
                cardNo = "";

                //合成卡号
                for (let i: number = 0; i < 4; i++) {
                  cardNo += ('0' + resp.data[i].toString(16)).slice(-2);
                }
              }

              this.globalSvr.hideLoading();
              this.globalSvr.showAlert("提示", `读卡成功, 卡号: [${cardNo}]`, 1200);
              this.globalSvr.offline.cardInfo = new Object();
              this.globalSvr.offline.cardInfo = cardNo;
              this.navCtrl.push(Offline2Page);// 跳转访客登记 - 确认访客信息页面
              return;
            } while (Date.now() - start < 3000);

            this.globalSvr.hideLoading();
            this.globalSvr.showAlert("提示", `读卡失败!`);
            return;
          } catch (err) {
            console.error(err);
          } finally {
            this.nativeSvr.SetIdReaderPause(false);
          }
        }
        else {
          result = await this.nativeSvr.execTask(TaskCode.TASK_START_OCR, type);
        }

        if (!result) {
          this.globalSvr.showAlert("错误", "OCR识别失败!");
          return;
        }

        if (result.Result !== 0) {
          this.globalSvr.showAlert("错误", `OCR识别失败[${result.Result}]!`);
          return;
        }

        ocrResult = result.Payload as OcrResult;
        this.globalSvr.offline.b64cred = ocrResult.picture;
        this.globalSvr.offline.cardInfo = ocrResult.content;

        console.log("ocr:", ocrResult.content);

        switch (type) {
          case 1: // 一代身份证
            idResult = ocrResult.content as OcrIdcardInfo;
            if (!idResult || !OcrIdcardInfo.isSuccess(idResult)) {
              this.globalSvr.showAlert(
                "错误",
                "OCR未识别到有效数据,请重试!",
                3000
              );
              return;
            }
            break;
          case 2: // 护照
            ppResult = ocrResult.content as OcrPpInfo;
            if (!ppResult || !OcrPpInfo.isSuccess(ppResult)) {
              this.globalSvr.showAlert(
                "错误",
                "OCR未识别到有效数据,请重试!",
                3000
              );
              return;
            }
            break;
          case 3: // 驾驶证
            dcResult = ocrResult.content as OcrDrivingCardInfo;
            if (!dcResult || !OcrDrivingCardInfo.isSuccess(dcResult)) {
              this.globalSvr.showAlert(
                "错误",
                "OCR未识别到有效数据,请重试!",
                3000
              );
              return;
            }
            break;
        }

        this.globalSvr.offline.mode = type;

        // 电子护照模式被启用
        if (type === 2 && this.globalSvr.enableEpp) {
          let info: OcrPpInfo = ocrResult.content as OcrPpInfo;

          this.globalSvr.showLoading("读取电子护照中...");

          do {
            try {
              let req: ReadPpRequest = new ReadPpRequest();
              let resp: ReadPpResult;

              req.sn = info.CardNo;
              req.birth = info.Birthday;
              req.expiry = info.ValidPeriod;

              result = await this.nativeSvr.execTask(
                TaskCode.TASK_READ_PP,  // 状态码为302
                0,
                JSON.stringify(req)
              );

              if (!result) {
                this.globalSvr.showAlert("错误", "读取电子护照失败!");
                break;
              }

              if (result.Result !== 0) {
                this.globalSvr.showAlert(
                  "错误",
                  `读取电子护照失败[${result.Result}]!`
                );
                break;
              }

              resp = result.Payload as ReadPpResult;

              if (!resp || !ReadPpResult.isSuccess(resp)) {
                if ("Info" in resp && "ResCode" in resp.Info) {
                  this.globalSvr.showAlert(
                    "错误",
                    `读取电子护照数据失败[${resp.Info.ResCode}]!`
                  );
                } else {
                  this.globalSvr.showAlert("错误", `读取电子护照数据失败!`);
                }
                break;
              }

              this.globalSvr.offline.mode = 5;
              this.globalSvr.offline.b64head = resp.BmpHead;
              this.globalSvr.offline.cardInfo2 = resp.Info;
            } catch (err) {
              this.globalSvr.showAlert("错误", "读取电子护照错误!");
              console.error(err);
            }
          } while (false);
        }

        this.navCtrl.push(Offline2Page);// 跳转访客登记 - 确认访客信息页面
      } catch (err) {
        this.globalSvr.showAlert("错误", "OCR识别错误!");
        console.error(err);
      } finally {
        this.globalSvr.hideLoading();
      }
    }, 0);
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
