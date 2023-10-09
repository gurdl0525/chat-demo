import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Joiner } from '../../chat/entity/chat.entity';
import { initializeInstance } from "ts-loader/dist/instances";

const oneToMany = OneToMany;

@Entity({
  name: 'user',
  orderBy: {
    id: 'DESC',
  },
})
export class User {
  @PrimaryColumn({
    name: 'id',
    type: 'binary',
    length: 36,
  })
  id!: string;

  @Column({ name: 'account_id', type: 'varchar', unique: true })
  account_id!: string;

  @Column({ name: 'password', type: 'char', length: 60 })
  password!: string;

  constructor(account_ld?: string, password?: string, id?: string) {
    if (account_ld && password) {
      this.id = id ?? uuid();
      this.account_id = account_ld!;
      this.password = password!;
    }
  }
  async toResponse() {
    return {
      id: this.id,
      accountId: this.account_id,
    };
  }
}
