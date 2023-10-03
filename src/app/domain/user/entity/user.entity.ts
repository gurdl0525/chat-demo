import { Column, Entity, PrimaryColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

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
  id: string;

  @Column({ name: 'account_id', type: 'varchar', unique: true })
  accountId: string;

  @Column({ name: 'password', type: 'char', length: 60 })
  password: string;
  constructor(accountId?: string, password?: string, id?: string) {
    if (accountId && password) {
      this.id = id ?? uuid();
      this.accountId = accountId!;
      this.password = password!;
    }
  }
}
