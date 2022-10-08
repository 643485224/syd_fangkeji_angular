import { Entity, Column, Index, PrimaryGeneratedColumn } from "typeorm";
import { EntityType } from "../providers/data-access-layer/entityType";

const tableName: string = "t_visitor";

@Entity(tableName)
export class TVisitor implements EntityType {
  public static get $tableName(): string {
    return tableName;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  birth?: number;

  @Column({ nullable: true })
  sex?: number;

  @Column({ nullable: true })
  folk?: string;

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
