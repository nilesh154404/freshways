import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Community } from "src/community/entities/community.entity";
import { Customer } from "src/customer/entities/customer.entity";

@Entity()
export class CommunityMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @ManyToOne(() => Community, community => community.id)
    community: Community;

    @ManyToOne(() => Customer, customer => customer.id)
    sender: Customer;

    @CreateDateColumn()
    createdAt: Date;
}
