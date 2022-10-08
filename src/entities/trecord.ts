import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";
import { EntityType } from "../providers/data-access-layer/entityType";

const tableName: string = "t_record";

@Entity(tableName)
export class TRecord implements EntityType {
  public static get $tableName(): string {
    return tableName;
  }

  /**
   * Id
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 记录类型
   */
  @Index()
  @Column({ default: 0 })
  type: number;

  /**
   * 记录状态:
   * 1: 在访
   * 2: 签离
   */
  @Column({ default: 0 })
  state: number;

  /**
   * 员工
   */
  //@ManyToOne
  @Index()
  @Column({ nullable: true })
  id_staff?: number;

  /**
   * 证件
   */
  @Index()
  @Column({ nullable: true })
  id_credential?: number;

  /**
   * 访客
   */
  @Index()
  @Column({ nullable: true })
  id_visitor?: number;

  /**
   * 员工姓名
   */
  @Index()
  @Column()
  s_name: string;

  /**
   * 员工工号
   */
  @Index()
  @Column()
  s_jobNum: string;

  /**
   * 员工手机
   */
  @Index()
  @Column()
  s_mobile: string;

  /**
   * 证件类型
   */
  @Column({ default: 0 })
  credType: number;

  /**
   * 证件号码
   */
  @Index()
  @Column({ default: "" })
  credNumber: string;

  /**
   * 生成条码
   */
  @Index()
  @Column()
  barcode: string;

  /**
   * 来访事由
   */
  @Column({ nullable: true })
  reason?: string;

  /**
   * 车牌号码
   */
  @Column({ nullable: true })
  plateNum?: string;

  /**
   * 来访时间
   */
  @Column()
  visitTime: number;

  /**
   * 离开时间
   */
  @Column({ nullable: true })
  leaveTime?: number;

  /**
   * 头部图像文件名
   */
  @Column({ nullable: true })
  pathBmpHead?: string;

  /**
   * 证件图像文件名
   */
  @Column({ nullable: true })
  pathBmpCred?: string;


  /**
   * 现场图像文件名
   */
  @Column({ nullable: true })
  pathBmpSite?: string;

  /**
   * 卡号
   */
  @Column({ nullable: true })
  cardNum?: string;

  /**
   * 访客姓名
   */
  @Index()
  @Column({ nullable: true })
  v_name?: string;

  /**
   * 访客性别
   */
  @Column({ nullable: true })
  v_sex: number;

  /**
   * 访客民族
   */
  @Column({ nullable: true })
  v_folk?: string;

  /**
   * 访客企业
   */
  @Column({ nullable: true })
  v_company?: string;

  /**
   * 访客部门
   */
  @Column({ nullable: true })
  v_department?: string;

  /**
   * 访客手机
   */
  @Index()
  @Column({ nullable: true })
  v_mobile?: string;

  public get VisitTime(): Date {
    let date: Date;
    date = new Date(this.visitTime);
    return date;
  }

  public set VisitTime(value: Date) {
    if (value) {
      this.visitTime = value.getTime();
    } else {
      this.visitTime = 0;
    }
  }

  public get LeaveTime(): Date | null {
    if (this.leaveTime) {
      let date: Date;
      date = new Date(this.leaveTime);
      return date;
    }

    return null;
  }

  public set LeaveTime(value: Date | null) {
    if (value) {
      this.leaveTime = value.getTime();
    } else {
      this.leaveTime = null;
    }
  }
}
