import { Entity, Column, Index, PrimaryGeneratedColumn } from "typeorm";
import { EntityType } from "../providers/data-access-layer/entityType";

const tableName: string = "t_staff";

@Entity(tableName)
export class TStaff implements EntityType {
  public static get $tableName(): string {
    return tableName;
  }

  /**
   * Id
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   *
   * 员工类型
   * @type {number}
   * @memberof TStaff
   */
  @Index()
  @Column({ default: 0 })
  type: number;

  /**
   * 员工状态
   *
   */
  @Column({ default: 0 })
  state: number;

  /**
   * 员工姓名
   */
  @Index()
  @Column()
  name: string;

  /**
   * 员工工号
   */
  @Index({ unique: true })
  @Column()
  jobNum: string;

  /**
   * 员工手机
   */
  @Index()
  @Column()
  mobile: string;

  /**
   * 员工卡号
   */
  @Column({ nullable: true })
  cardNum?: string;

  /**
   * 员工生日
   */
  @Column({ nullable: true })
  birth?: number;

  /**
   * 员工性别
   */
  @Column({ nullable: true })
  sex?: number;

  /**
   * 员工民族
   */
  @Column({ nullable: true })
  folk?: string;

  /**
   * 员工企业
   */
  @Column({ nullable: true })
  company?: string;

  /**
   * 员工部门
   */
  @Column({ nullable: true })
  department?: string;

  get Birth(): Date {
    if (this.birth) return new Date(this.birth);
    else return null;
  }

  set Birth(value: Date) {
    this.birth = value.getTime();
  }
}
