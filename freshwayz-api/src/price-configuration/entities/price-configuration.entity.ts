import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class PriceConfiguration {
    @PrimaryColumn({ length: 50 })
    label: string;

    @Column({ type: "float" })
    value: number;
}
