import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";
import { EntityType } from "../providers/data-access-layer/entityType";

const tableName: string = "t_credential";

@Entity(tableName)
export class TCredential implements EntityType {
  public static get $tableName(): string {
    return tableName;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  type: number;

  /**
   * 访客Id
   */
  @Column()
  id_visitor: number;

  @Index()
  @Column()
  credNumber: string;

  @Index()
  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  sex?: number;

  @Column({ nullable: true })
  folk?: string;

  @Column({ nullable: true })
  birth?: number;

  @Column({ nullable: true })
  address?: string;

  /**
   * 证件JSON
   */
  @Column({ nullable: true })
  content?: string;

  /**
   * 证件图像文件名
   */
  @Column({ nullable: true })
  pathBmpCred?: string;

  /**
   * 头像图像文件名
   */
  @Column({ nullable: true })
  pathBmpHead?: string;

  get Birth(): Date {
    if (this.birth) return new Date(this.birth);
    else return null;
  }

  set Birth(value: Date) {
    this.birth = value.getTime();
  }
}
