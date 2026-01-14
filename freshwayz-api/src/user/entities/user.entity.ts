import { Auth } from "src/auth/entities/auth.entity";
import { UserType } from "src/user-type/entities/user-type.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @ManyToOne(() => UserType, userType => userType.users, { nullable: false })
    userType: UserType;

    @OneToOne(() => Auth, auth => auth.user, { nullable: true })
    auth?: Auth;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
