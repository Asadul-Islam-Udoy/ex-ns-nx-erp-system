import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => User) @JoinColumn({ name: 'user_id' }) user: User;
  @Column() tokenHash: string; // hashed token
  @Column({ default: false }) revoked: boolean;
  @CreateDateColumn() createdAt: Date;
  @Column({ type: 'timestamp', nullable: true }) expiresAt: Date;
}
