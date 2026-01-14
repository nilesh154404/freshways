import { Customer } from "src/customer/entities/customer.entity";
import { User } from "src/user/entities/user.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToMany } from "typeorm";

@Entity()
export class Auth {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @OneToOne(() => User, user => user.auth, { nullable: true })
    @JoinColumn()
    user?: User;

    @OneToOne(() => Vendor, vendor => vendor.auth, { nullable: true })
    @JoinColumn()
    vendor?: Vendor;

    @OneToOne(() => Customer, customer => customer.auth, { nullable: true })
    @JoinColumn()
    customer?: Customer;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
