import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Subscription } from "rxjs";
import { GlobalProvider } from "../../providers/global/global";
import { NativeApiProvider, IdCardInfo, TaskResult, OcrResult, OcrIdcardInfo, OcrPpInfo, OcrDrivingCardInfo, TaskCode, ReadPpRequest, ReadPpResult } from '../../providers/native-api/native-api';
import { Onsite2Page } from "./onsite2";
import { sleep } from "../../app/common";

@IonicPage({
  segment: "onsite"
})
@Component({
  selector: "page-onsite",
  templateUrl: "onsite.html"
})
export class OnsitePage {  // 选择证件类型页面
  private subIdcard: Subscription = null;
  private idcard: IdCardInfo = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeSvr: NativeApiProvider
  ) { }

  ionViewDidLoad() {

  }

  ionViewWillUnload() {

  }

  ionViewDidEnter() {
    this.globalSvr.onsite.reset();
    this.setHandler();
  }

  ionViewDidLeave() {
    this.idcard = null;
    this.cleanHandler();
  }

  private setHandler() {
    this.subIdcard = this.nativeSvr.subscribe_IdCard().subscribe((data: IdCardInfo) => {
      if (data == null) return;

      this.idcard = data;

      let now = new Date();
      let nowNumber = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + (now.getDate());
      let expire = this.idcard.Expire;
      if (parseInt(expire) < nowNumber) {
        this.globalSvr.showAlert("警告", "身份证过期");
        sleep(500);
      }

      this.globalSvr.onsite.mode = 4;
      this.globalSvr.onsite.idcard = data;
      this.globalSvr.onsite.b64head = data.Head;

      this.navCtrl.push(Onsite2Page); // 跳转现场登记-确认访客信息页面
    });
  }

  private cleanHandler() {
    if (this.subIdcard) {
      this.subIdcard.unsubscribe();
      this.subIdcard = null;
    }
  }

  protected onOcrClick(event: any, type: number) { // 根据选择识别的证件传递不同的参数触发对应的方法
    if (type == 6) {  // 无证登记
      this.navCtrl.push(Onsite2Page);// 跳转现场登记-确认访客信息页面
      this.globalSvr.onsite.mode = type;
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

        result = await this.nativeSvr.execTask(TaskCode.TASK_START_OCR, type);// ASK_START_OCR状态码为301

        if (!result) {
          this.globalSvr.showAlert("错误", "OCR识别失败!");
          return;
        }

        if (result.Result !== 0) {
          this.globalSvr.showAlert("错误", `OCR识别失败[${result.Result}]!`);
          return;
        }

        ocrResult = result.Payload as OcrResult;
        this.globalSvr.onsite.b64cred = ocrResult.picture;
        this.globalSvr.onsite.cardInfo = ocrResult.content;

        console.log("ocr:", ocrResult.content);

        switch (type) {
          case 1:   //一代身份证
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

        this.globalSvr.onsite.mode = type;

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
                TaskCode.TASK_READ_PP,
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

              this.globalSvr.onsite.mode = 5;
              this.globalSvr.onsite.b64head = resp.BmpHead;
              this.globalSvr.onsite.cardInfo2 = resp.Info;
            } catch (err) {
              this.globalSvr.showAlert("错误", "读取电子护照错误!");
              console.error(err);
            }
          } while (false);
        }

        this.navCtrl.push(Onsite2Page);// 跳转现场登记-确认访客信息页面
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
