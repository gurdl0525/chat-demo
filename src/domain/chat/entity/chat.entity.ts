import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
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
  id!: string;

  @Column({ name: 'name', nullable: false })
  name!: string;

  constructor(name?: string, id?: string) {
    if (name) {
      this.id = id ?? uuid();
      this.name = name;
    }
  }
}

@Entity({
  name: 'joiner',
})
export class Joiner {
  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room' })
  room!: Room;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user' })
  user!: User;

  @PrimaryColumn({
    type: 'binary',
    length: 36,
  })
  room_id!: string;

  @PrimaryColumn({
    type: 'binary',
    length: 36,
  })
  user_id!: string;

  constructor(room?: Room, user?: User) {
    if (room && user) {
      this.room = room;
      this.user = user;
      this.room_id = room.id;
      this.user_id = user.id;
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

  @ManyToOne(() => Joiner, { nullable: false })
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
