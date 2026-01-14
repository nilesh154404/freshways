import { Customer } from "src/customer/entities/customer.entity";
import { Order } from "src/orders/entities/order.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity()
export class Community {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column()
    type: string;

    @Column()
    address: string;

    @OneToMany(() => Order, order => order.community)
    orders: Order[];
    
    @ManyToMany(() => Customer, customer => customer.communities)
    @JoinTable() // this side will store relation table
    customers: Customer[];
}