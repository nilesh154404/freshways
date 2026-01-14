import { User } from "src/user/entities/user.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class UserType {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    typeName: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => User, user => user.userType)
    users: User[];

    @OneToMany(() => Vendor, vendor => vendor.userType)
    vendors: Vendor[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
