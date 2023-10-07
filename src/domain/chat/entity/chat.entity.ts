import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { v4 as uuid } from 'uuid';

@Entity({
  name: 'room',
  orderBy: {
    id: 'DESC',
  },
})
export class Room {
  @PrimaryColumn({
    name: 'id',
    type: 'binary',
    length: 36,
  })
  id: string;

  @Column({ name: 'name', nullable: false })
  name: string;

  @OneToMany(() => Joiner, (joiner) => joiner.room_id)
  joiner_list: Joiner[];

  constructor(name?: string, joiner_list?: Joiner[], id?: string) {
    if (name) {
      this.id = id ?? uuid();
      this.name = name;
      this.joiner_list = joiner_list ?? [];
    }
  }
}

@Entity({
  name: 'joiner',
  orderBy: {
    id: 'DESC',
  },
})
export class Joiner {
  @ManyToOne(() => Room, (room) => room.id)
  @JoinColumn({ name: 'room_id' })
  @PrimaryColumn({
    type: 'binary',
    length: 36,
  })
  room_id!: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  @PrimaryColumn({
    type: 'binary',
    length: 36,
  })
  user_id!: string;

  @OneToMany(() => Chat, (chat) => chat.joiner)
  chat_list: Chat[];

  constructor(room?: Room, user?: User, chat_list?: Chat[]) {
    if (room && user) {
      this.room_id = room.id;
      this.user_id = user.id;
      this.chat_list = chat_list ?? [];
    }
  }
}

@Entity({
  name: 'chat',
  orderBy: {
    id: 'DESC',
  },
})
export class Chat {
  @PrimaryColumn({
    name: 'id',
    type: 'binary',
    length: 36,
  })
  id: string;

  @ManyToOne(() => Joiner)
  @JoinColumn([
    { name: 'room_id', referencedColumnName: 'room_id' },
    { name: 'user_id', referencedColumnName: 'user_id' },
  ])
  joiner: Joiner;

  @Column({ name: 'text', nullable: false, length: 1000 })
  text: string;

  constructor(text?: string, joiner?: Joiner, id?: string) {
    if (text && joiner) {
      this.text = text;
      this.joiner = joiner;
      this.id = id ?? uuid();
    }
  }
}
