import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { EntityType } from "../providers/data-access-layer/entityType";

const tableName: string = "t_test";

@Entity(tableName)
export class TTest implements EntityType {
  public static get $tableName(): string {
    return tableName;
  }

  /**
   * Id
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 状态
   *
   */
  @Column({ default: 0 })
  state: number;

  /**
   * 文本
   */
  @Column()
  text: string;

  /**
   * 员工生日
   */
  @Column({ nullable: true })
  date: number;

  get Date(): Date {
    if (this.date) return new Date(this.date);
    else return null;
  }

  set Date(value: Date) {
    this.date = value.getTime();
  }
}
