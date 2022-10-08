import { OcrPpInfo, ReadPpInfo, IdCardInfo, OcrIdcardInfo, OcrDrivingCardInfo } from '../native-api/native-api';
import { FullVisitorInfo, StaffInfo, VisitorInfo } from '../webapi/webapi';
import { TStaff } from '../../entities/tstaff';
import { getSexStr, getSexNum } from '../../app/common';

export class Message {
  Code: number;
  State: number;
  Param: any;

  public static create(Code: number, State: number, Param?: any): Message {
    let result: Message = new Message();
    result.Code = Code;
    result.State = State;
    if (Param) result.Param = Param;
    return result;
  }
}

export class VisitorData {
  public name: string = "";
  public sex: 0 | 1 | 2 = 0;
  public folk: string = "";
  public mobile: string = "";
  public reason: string = "";
  public plateNum: string = "";
  public company: string = "";
  public credNum: string = "";
  public linshiperson: string = "";

  public reset() {
    this.name = "";
    this.sex = 0;
    this.folk = "";
    this.mobile = "";
    this.reason = "";
    this.plateNum = "";
    this.company = "";
    this.credNum = "";
    this.linshiperson=""
  }
}

export class CheckinData {
  public mode: number = 0;
  //邀请码
  public regcode: string = null;
  public idcard: IdCardInfo = null;
  public b64picture: string = null;
  public visitor: FullVisitorInfo = null;
  public staff: StaffInfo = null;

  public reset() {
    this.mode = 0;
    this.regcode = null;
    this.idcard = null;
    this.b64picture = null;
    this.visitor = null;
    this.staff = null;
  }

  public get name(): string {
    if (this.idcard && this.idcard.Name) return this.idcard.Name;
    if (this.visitor && this.visitor.v_name) return this.visitor.v_name;
    return "";
  }

  public get sex(): string {
    if (this.idcard && this.idcard.Sex) return this.idcard.Sex;
    if (this.visitor) {
      switch (this.visitor.v_sex) {
        case 1:
          return "男";
        case 1:
          return "女";
        default:
          return "未知";
      }
    }
  }
}

export class OnsiteData {
  /**
   * mode: 现场登记模式
   *
   * 1:     OCR身份证
   * 2:     OCR护照
   * 3:     OCR驾驶证
   * 4:     读取身份证
   * 5:     电子护照
   */
  public mode: number = 0;
  public idcard: IdCardInfo = null;
  public cardInfo: any = null;
  public cardInfo2: any = null;
  public b64picture: string = null;
  public b64cred: string = null;
  public b64head: string = null;
  public visitor: VisitorInfo = null;
  public staff: StaffInfo = null;

  public reset() {
    this.mode = 0;
    this.idcard = null;
    this.cardInfo = null;
    this.cardInfo2 = null;
    this.b64picture = null;
    this.b64cred = null;
    this.b64head = null;
    this.visitor = null;
    this.staff = null;
  }

  public get name(): string {
    if (this.idcard && this.idcard.Name) return this.idcard.Name;
    if (this.visitor && this.visitor.v_name) return this.visitor.v_name;
    return "";
  }

  public get sex(): string {
    if (this.idcard && this.idcard.Sex) return this.idcard.Sex;
    if (this.visitor) {
      switch (this.visitor.v_sex) {
        case 1:
          return "男";
        case 1:
          return "女";
        default:
          return "未知";
      }
    }
  }
}

export class OfflineData {
  /**
   * mode: 离线登记模式
   *
   * 1:     OCR身份证
   * 2:     OCR护照
   * 3:     OCR驾驶证
   * 4:     读取身份证
   * 5:     电子护照
   */
  public mode: number = 0;
  /**
   * 读取的身份证信息
   */
  public idcard: IdCardInfo = null;
  /**
   * OCR证件信息
   */
  public cardInfo: any = null;
  /**
   * 额外的补充信息 (电子护照)
   */
  public cardInfo2: any = null;
  /**
   * 现场抓拍图
   */
  public b64picture: string = null;
  /**
   * 证件图片
   */
  public b64cred: string = null;
  /**
   * 人脸头像
   */
  public b64head: string = null;
  public visitor: VisitorData = new VisitorData();
  public staff: TStaff = null;

  public reset() {
    this.mode = 0;
    this.idcard = null;
    this.cardInfo = null;
    this.cardInfo2 = null;
    this.b64picture = null;
    this.b64cred = null;
    this.b64head = null;
    this.visitor.reset();
    this.staff = null;
  }

  public get name(): string {
    if (this.visitor.name) return this.visitor.name;

    switch (this.mode) {
      case 1:
        {
          let info: OcrIdcardInfo;
          info = this.cardInfo;

          if (info && info.Name) return info.Name;
        }
        break;
      case 2:
        {
          let info: OcrPpInfo;
          info = this.cardInfo;

          if (info && info.NameCh) return info.NameCh;
        }
        break;
      case 3:
        {
          let info: OcrDrivingCardInfo;
          info = this.cardInfo;

          if (info && info.Name) return info.Name;
        }
        break;
      case 4:
        {
          if (this.idcard && this.idcard.Name) return this.idcard.Name;
        }
        break;
      case 5:
        {
          let info: OcrPpInfo;
          let info2: ReadPpInfo;

          if (info2 && info2.DG11_LocalName) return info2.DG11_LocalName;
          if (info && info.NameCh) return info.NameCh;
        }
        break;
    }
    return this.visitor.name || "";
  }

  public get sex(): string {
    if (this.visitor.sex) return getSexStr(this.visitor.sex);

    switch (this.mode) {
      case 1:
        {
          let info: OcrIdcardInfo;
          info = this.cardInfo;

          if (info && info.Sex) return info.Sex;
        }
        break;
      case 2:
        {
          let info: OcrPpInfo;
          info = this.cardInfo;

          if (info && info.SexCH) return info.SexCH;
        }
        break;
      case 3:
        {
          let info: OcrDrivingCardInfo;
          info = this.cardInfo;

          if (info && info.Sex) return info.Sex;
        }
        break;
      case 4:
        {
          if (this.idcard && this.idcard.Sex) return this.idcard.Sex;
        }
        break;
      case 5:
        {
          let info: OcrPpInfo;
          let info2: ReadPpInfo;

          if (info2 && info2.DG1_Sex)
            return getSexStr(getSexNum(info2.DG1_Sex));
          if (info && info.SexCH) return info.SexCH;
        }
        break;
    }

    return getSexStr(this.visitor.sex) || "未知";
  }

  public get credNum(): string {
    if (this.visitor.credNum) return this.visitor.credNum;

    switch (this.mode) {
      case 1:
        {
          let info: OcrIdcardInfo;
          info = this.cardInfo;

          if (info && info.Num) return info.Num;
        }
        break;
      case 2:
        {
          let info: OcrPpInfo;
          info = this.cardInfo;

          if (info && info.CardNo) return info.CardNo;
        }
        break;
      case 3:
        {
          let info: OcrDrivingCardInfo;
          info = this.cardInfo;

          if (info && info.CardNo) return info.CardNo;
        }
        break;
      case 4:
        {
          if (this.idcard && this.idcard.IdNo) return this.idcard.IdNo;
        }
        break;
      case 5:
        {
          let info: OcrPpInfo;
          let info2: ReadPpInfo;

          if (info2 && info2.DG11_Number) return info2.DG11_Number;
          if (info && info.CardNo) return info.CardNo;
        }
        break;
    }

    return this.visitor.credNum || "";
  }
}
