import {
  Component
} from "@angular/core";
import {
  NavController,
  NavParams
} from "ionic-angular";
import {
  GlobalProvider
} from "../../providers/global/global";
import {
  getSexNum,
  formatNormal,
  getDateNumber,
  getCode,
  sleep
} from "../../app/common";
import {
  DataAccessLayerProvider
} from "../../providers/data-access-layer/data-access-layer";
import {
  TVisitor
} from "../../entities/tvisitor";
import {
  TCredential
} from "../../entities/tcredential";
import {
  TRecord
} from "../../entities/trecord";
import {
  TaskResult,
  OcrPpInfo,
  OcrDrivingCardInfo,
  IdCardInfo,
  ReadPpInfo
} from "../../providers/native-api/native-api";
import {
  clone,
  formatChsText
} from '../../app/common';
import {
  VisitorData
} from '../../providers/global/typedef';
import {
  NativeApiProvider,
  PrintRequest,
  OcrIdcardInfo,
  TaskCode
} from "../../providers/native-api/native-api";


@Component({
  selector: "page-offline5",
  templateUrl: "offline5.html"
})
export class Offline5Page {  // 登记并打印凭条页面
  protected step = 1;
  protected count: number = 4;
  protected errorText: string = "";
  private timer: number = null;
  private timer2: number = null;
  private barcode: string = null;
  private time: Date = null;
  private totalcount: number = 10000; //10000
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public nativeSvr: NativeApiProvider,
    public dal: DataAccessLayerProvider
  ) { }

  ionViewDidLoad() {
    this.proc();
  }

  ionViewDidLeave() {
    if (this.timer) window.clearInterval(this.timer);
    if (this.timer2) window.clearInterval(this.timer2);
  }

  private createTimer() {
    this.count = 4;
    this.timer = window.setInterval(() => {
      this.count--;

      if (this.count <= 0) {
        this.step = 3;
        window.clearInterval(this.timer);
        this.timer = null;
        this.createEndTimer();
      }
    }, 1000);
  }

  private createEndTimer() {
    this.count = 4;
    this.timer2 = window.setInterval(() => {
      this.count--;

      if (this.count <= 0) {
        window.clearInterval(this.timer2);
        this.timer2 = null;
        this.navCtrl.popToRoot();
      }
    }, 1000);
  }

  private async print(time: string, code: string) {
    let request: PrintRequest = new PrintRequest();
    let result: TaskResult;

    request.Title = "访客登记单";
    request.Name = this.globalSvr.offline.name;  // 姓名
    request.Sex = this.globalSvr.offline.sex;   // 性别
    request.Bitmap2 = this.globalSvr.offline.b64picture; // 头像
    request.CardNum = this.globalSvr.offline.visitor.credNum; // 证件号码
    request.Time = formatNormal(new Date());
    request.Code = code;

    if (this.globalSvr.offline.visitor) {
      request.Reason = this.globalSvr.offline.visitor.reason; // 来访事由
      request.Company = this.globalSvr.offline.visitor.company;// 访客单位
      request.Mobile = this.globalSvr.offline.visitor.mobile; // 手机号码
    }

    if (this.globalSvr.offline.staff) {
      request.Interviewee = this.globalSvr.offline.staff.name;// 被访人姓名
      request.Department = this.globalSvr.offline.staff.company;// 被访人公司
    } else {
      request.Interviewee = '无';
      request.Department = '无';
    }

    try {
      result = await this.nativeSvr.printForm(request);

      if (!result) {
        this.globalSvr.showAlert("提示", `打印机未响应!`)
      } else if (result.Result !== 0) {
        this.globalSvr.showAlert("错误", `打印凭条失败, 打印机故障或缺纸[${result.Result}]!`)
      }
    } catch (err) {
      console.error(err);
      if (err === 'timeout') {
        this.globalSvr.showAlert("提示", `打印超时!`)
      }
    }
  }

  private async saveInfo() {
    let taskRes: TaskResult;
    let pathCred: string = null;
    let pathHead: string = null;
    let pathSite: string = null;
    let visitor: TVisitor = new TVisitor();
    let cred: TCredential = new TCredential();
    let record: TRecord = new TRecord();
    // 保存照片
    try {
      if (this.globalSvr.offline.b64cred) {  //证件图片
        taskRes = await this.nativeSvr.execTask(//调用接口
          TaskCode.TASK_SAVE_PICTURE, // 107
          0,
          "C",
          this.globalSvr.offline.b64cred
        );

        if (taskRes.Result === 0) pathCred = taskRes.Payload;
      }

      if (this.globalSvr.offline.b64head) {  // 人脸头像
        taskRes = await this.nativeSvr.execTask(  //调用接口
          TaskCode.TASK_SAVE_PICTURE, // 107
          0,
          "H",
          this.globalSvr.offline.b64head
        );

        if (taskRes.Result === 0) pathHead = taskRes.Payload;
      }

      if (this.globalSvr.offline.b64picture) {  //现场抓拍图
        taskRes = await this.nativeSvr.execTask(//调用接口
          TaskCode.TASK_SAVE_PICTURE,   // 107
          0,
          "S",
          this.globalSvr.offline.b64picture
        );

        if (taskRes.Result === 0) pathSite = taskRes.Payload;
      }
    } catch (err) {
      console.error(err);
    }

    // 证件模式
    try {
      //
      switch (this.globalSvr.offline.mode) {
        // OCR 身份证
        case 1: {
          let info: OcrIdcardInfo;

          info = this.globalSvr.offline.cardInfo as OcrIdcardInfo;
          cred.type = this.globalSvr.offline.mode;

          if (info) {
            cred.name = info.Name;
            cred.credNumber = info.Num;
            cred.sex = getSexNum(info.Sex);
            cred.folk = info.Folk;
            cred.birth = getDateNumber(info.Birt);
            cred.address = info.Addr;
            cred.content = JSON.stringify(info);
          }
        }
          break;
        // OCR 护照
        case 2: {
          let info: OcrPpInfo;

          info = this.globalSvr.offline.cardInfo as OcrPpInfo;
          cred.type = this.globalSvr.offline.mode;

          if (info) {
            cred.name = info.NameCh;
            cred.credNumber = info.CardNo;
            cred.sex = getSexNum(info.Sex);
            cred.birth = getDateNumber(info.Birthday);
            cred.address = info.AddressCH;
            cred.content = JSON.stringify(info);
          }
        }
          break;
        // OCR 驾照
        case 3: {
          let info: OcrDrivingCardInfo;

          info = this.globalSvr.offline.cardInfo as OcrDrivingCardInfo;
          cred.type = this.globalSvr.offline.mode;

          if (info) {
            cred.name = info.Name;
            cred.credNumber = info.CardNo;
            cred.sex = getSexNum(info.Sex);
            cred.address = info.Address;
            cred.content = JSON.stringify(info);
          }
        }
          break;
        // 读取身份证
        case 4: {
          let info: IdCardInfo;

          info = clone(this.globalSvr.offline.idcard);
          info.Head = null;

          cred.type = this.globalSvr.offline.mode;
          cred.name = info.Name;
          cred.sex = getSexNum(info.Sex);
          cred.folk = info.Folk;
          cred.credNumber = info.IdNo;
          cred.address = info.Address;
          cred.birth = getDateNumber(info.Birth);
          cred.content = JSON.stringify(info);
        }
          break;
        // 读取电子护照
        case 5: {
          let info: OcrPpInfo;
          let info2: ReadPpInfo;
          let obj: any = {};

          info = this.globalSvr.offline.cardInfo as OcrPpInfo;
          info2 = this.globalSvr.offline.cardInfo2 as ReadPpInfo;

          cred.type = this.globalSvr.offline.mode;
          cred.name = info2.DG11_LocalName;
          cred.credNumber = info2.DG11_Number;
          cred.sex = getSexNum(info2.DG1_Sex);
          cred.birth = getDateNumber(info.Birthday);
          cred.address = info2.DG11_Addr;
          obj.ocr = info;
          obj.read = info2;
          cred.content = JSON.stringify(obj);
        }
          break;
        case 6: {
          //姓名，性别，证件号码，手机号，来访事由，车牌号码  访客单位
          // console.log(666);
          cred.name = this.globalSvr.offline.visitor.name;
          cred.sex = getSexNum((this.globalSvr.offline.visitor.sex).toString());
          cred.credNumber = this.globalSvr.offline.visitor.credNum;
          record.s_mobile = this.globalSvr.offline.visitor.mobile;
          record.reason = this.globalSvr.offline.visitor.reason;
          record.plateNum = this.globalSvr.offline.visitor.plateNum;
          record.v_company = this.globalSvr.offline.visitor.company;

        }
          break;
      }
    } catch (err) {
      console.error(err);
    }

    // 查询是否已存在访客
    try {
      let find: TCredential | number;

      // 判断证件号是否已记录
      find = await this.dal.queryOne(TCredential, {
        type: cred.type,
        credNumber: cred.credNumber
      });

      // 已存在访客
      if (find && typeof find === "object" && find.id) {
        record.type = 1;
        record.state = 1;

        record.id_credential = find.id;
        record.credType = find.type;
        record.credNumber = find.credNumber;

        record.id_visitor = find.id_visitor;
        record.v_name = this.globalSvr.offline.visitor.name;
        record.v_sex = this.globalSvr.offline.visitor.sex;
        record.v_folk = find.folk || this.globalSvr.offline.visitor.folk;
        record.v_mobile = this.globalSvr.offline.visitor.mobile;
        record.v_company = this.globalSvr.offline.visitor.company;
        record.reason = this.globalSvr.offline.visitor.reason;
        record.plateNum = this.globalSvr.offline.visitor.plateNum;

        if (this.globalSvr.offline.staff) {
          record.id_staff = this.globalSvr.offline.staff.id;
          record.s_name = this.globalSvr.offline.staff.name;
          record.s_jobNum = this.globalSvr.offline.staff.jobNum;
          record.s_mobile = this.globalSvr.offline.staff.mobile;
        } else {
          record.id_staff = 0;
          record.s_name = '无';
          record.s_jobNum = '无';
          record.s_mobile = '无';
        }

        record.pathBmpHead = pathHead;
        record.pathBmpCred = pathCred;
        record.pathBmpSite = pathSite;
        record.barcode = this.barcode;
        record.visitTime = this.time.getTime();

        /**
         * 只保存10000条记录，超出的话，保存最新的然后删除最旧的 保留10001 删除 10001-10000
         */
        let sum = await this.dal.count(TRecord); //此时数据库里有多少条记录
        if (sum >= this.totalcount) {
          // this.globalSvr.RecordCount++; //每超出一次1w，RecordCount+1

          // this.nativeSvr.setConfig("RecordCount", String(this.globalSvr.RecordCount)); //将数据存到本地
          // console.log('RecordCount2', this.globalSvr.RecordCount);

          // console.log('需要删除的id是--', this.globalSvr.RecordCount);

          // await this.dal.delete(TRecord, this.globalSvr.RecordCount);
          let record1: TRecord | number;
          record1 = await this.dal.queryOne(TRecord, undefined, {
            id: "ASC"
          });

          console.log('需要删除的record1是--', record1);
          if (record1 && typeof record1 === "object") {
            console.log('需要删除的record1.id2是--', record1.id);
            await this.dal.delete(TRecord, record1.id);
          }

        }
        record = (await this.dal.save(TRecord, record)) as TRecord;
        return;



      }
    } catch (err) {
      console.error(err);
    }

    // 新访客, 保存信息
    try {
      let cred2: TCredential;
      let visitor2: TVisitor;

      cred.pathBmpHead = pathHead;
      cred.pathBmpCred = pathCred;

      visitor.name = this.globalSvr.offline.visitor.name;
      visitor.sex = this.globalSvr.offline.visitor.sex;
      visitor.folk = cred.folk || this.globalSvr.offline.visitor.folk;
      visitor.birth = cred.birth;
      visitor.pathBmpHead = pathHead;

      visitor2 = (await this.dal.save(TVisitor, visitor)) as TVisitor;

      if (visitor && typeof visitor2 === 'object' && visitor2.id) {
        record.id_visitor = cred.id_visitor = visitor2.id;
      }

      cred2 = (await this.dal.save(TCredential, cred)) as TCredential;

      if (cred && typeof cred2 === 'object' && cred2.id) {
        record.id_credential = cred2.id;
      }

      record.type = 1;
      record.state = 1;

      record.credType = cred.type;
      record.credNumber = cred.credNumber;

      record.v_name = visitor.name;
      record.v_sex = visitor.sex;
      record.v_folk = visitor.folk;
      record.v_mobile = this.globalSvr.offline.visitor.mobile;
      record.v_company = this.globalSvr.offline.visitor.company;
      record.reason = this.globalSvr.offline.visitor.reason;
      record.plateNum = this.globalSvr.offline.visitor.plateNum;

      if (this.globalSvr.offline.staff) {
        record.id_staff = this.globalSvr.offline.staff.id;
        record.s_name = this.globalSvr.offline.staff.name;
        record.s_jobNum = this.globalSvr.offline.staff.jobNum;
        record.s_mobile = this.globalSvr.offline.staff.mobile;
      } else {
        record.id_staff = 0;
        record.s_name = '无';
        record.s_jobNum = '无';
        record.s_mobile = '无';
      }

      record.pathBmpHead = pathHead;
      record.pathBmpCred = pathCred;
      record.pathBmpSite = pathSite;
      record.barcode = this.barcode;
      record.visitTime = this.time.getTime();

      let sum = await this.dal.count(TRecord); //此时数据库里有多少条记录

      if (sum >= this.totalcount) {
        //this.globalSvr.RecordCount++; //每超出一次1w，RecordCount+1
        //this.nativeSvr.setConfig("RecordCount", String(this.globalSvr.RecordCount));

        let record1: TRecord | number;
        record1 = await this.dal.queryOne(TRecord, undefined, {
          id: "ASC"
        });

        console.log('需要删除的id2是--', record1);
        if (record1 && typeof record1 === "object") {
          console.log('需要删除的id2是--', record1.id);
          await this.dal.delete(TRecord, record1.id);
        }
      }

      record = (await this.dal.save(TRecord, record)) as TRecord;
    } catch (err) {
      console.error(err);
    }
  }

  private async proc() {
    let data: VisitorData;

    try {
      data = this.globalSvr.offline.visitor;

      if (!data) {
        this.errorText = "访客信息不存在!";
        this.step = 10;
        return;
      }
      if (this.globalSvr.enable_visitor) {
        if (!this.globalSvr.offline.staff) {
          this.errorText = "被访人信息不存在!";
          this.step = 10;
          return;
        }
      }

      //this.globalSvr.showLoading("保存登记信息中");
      this.barcode = getCode();
      this.time = new Date();

      await this.saveInfo();
    } catch (err) {
      console.error(err);
    } finally {
      await sleep(100);
      //this.globalSvr.hideLoading();
    }
    if (this.globalSvr.enable_print) {
      this.step = 2;
      this.createTimer();

      window.setTimeout(() => {
        this.print(formatChsText(this.time), this.barcode);
      }, 200);
    } else {
      this.step = 3;
      this.createEndTimer();
    }

  }

  protected onGoBack() {   // 返回首页
    this.navCtrl.popToRoot();
  }


}