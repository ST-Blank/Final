import { Entity, PrimaryGeneratedColumn,Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity('url')
export class Url {

    @PrimaryGeneratedColumn('uuid')
    public id?: string;

    @Column()
    public urlFull!: string;

    @Column()
    public urlShort!: string;

    @Column()
    public userId?: string;

    @ManyToOne(()=>User,(user)=>user.url,{
        onDelete:'CASCADE'
    })
    public user!: User;
}