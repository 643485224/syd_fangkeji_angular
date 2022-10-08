import { Component, ViewChild } from "@angular/core";
import { NavController, NavParams, Tab } from "ionic-angular";
import { GlobalProvider } from "../../providers/global/global";
import {
  TableViewComponent,
  TableRow,
  ItemButton,
  TableController
} from "../../components/tableview/tableview";
import { FullVisitorInfo, WebapiProvider } from '../../providers/webapi/webapi';
import { Appointment3Page } from "./appointment3";

class Params {
  list: FullVisitorInfo[];
}

@Component({
  selector: "page-appointment2",
  templateUrl: "appointment2.html"
})
export class Appointment2Page {
  @ViewChild("tableView")
  table: TableViewComponent;
  private params: Params;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSvr: GlobalProvider,
    public webApiSvr: WebapiProvider
  ) { }

  ionViewDidLoad() {
    this.table.addColHeader("编号", "id", "140px");
    this.table.addColHeader("被访人", "isv_name", "240px");
    this.table.addColHeader("邀请码", "inviteCode", "280px");
    this.table.addColHeader("预约时间", "v_time", "340px");
    this.table.addColHeader("操作", "#btns", "auto");
    this.params = this.navParams.data;
    this.table.hookOutputText((row: TableRow, name: string, result: string): string => {
      try {
        if (name === "inviteCode") {
          return atob(result);
        }
      } catch (err) {
        console.error(err);
      }

      return result;
    });

  }

  ionViewWillEnter() {
    if (this.params && this.params.list) {
      let items: TableRow[] = new Array<TableRow>();
      let item: TableRow;

      for (let i: number = 0; i < this.params.list.length; i++) {
        item = new TableRow(this.params.list[i]);

        item.addButton(
          "btns",
          "选择",
          "",
          this.params.list[i],
          (event: any, item: ItemButton, tabCtrl: TableController) => {
            this.globalSvr.checkin.visitor = item.param;

            try {
              if (
                this.globalSvr.checkin.mode === 2 &&
                this.globalSvr.checkin.visitor.inviteCode
              ) {
                this.globalSvr.checkin.regcode = atob(
                  this.globalSvr.checkin.visitor.inviteCode
                );
              }
            } catch (err) {
              console.error(err);
            }

            try {
              if (this.globalSvr.checkin.visitor) {
                let tmp: string;

                tmp = this.globalSvr.checkin.visitor.v_certificateNumber;

                if (tmp) {
                  console.debug("credNum401:", tmp);
                  tmp = window.$native.aesDecrypt(tmp, this.webApiSvr.encKey);
                  console.debug("credNum402:", tmp);
                  this.globalSvr.checkin.visitor.v_certificateNumber = tmp;
                }
              }
            } catch (err) {
              console.error(err);
            }

            this.navCtrl.push(Appointment3Page, { // 跳转到预约来访 - 抓拍人脸页面
              params: {
                mode: this.globalSvr.checkin.mode,
                bitmap:
                  this.globalSvr.checkin.mode === 2
                    ? this.globalSvr.checkin.idcard.Head
                    : "",
                visitorInfo: this.globalSvr.checkin.visitor,
                staffInfo: this.globalSvr.checkin.staff,
                idcard: this.globalSvr.checkin.idcard
              }
            });
          }
        );

        items.push(item);
      }

      this.table.bindRow(items);
    }
  }
  protected Back(event: any) {
    this.navCtrl.pop();
  }
}
