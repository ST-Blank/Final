import { type } from "os";
import {Entity, PrimaryGeneratedColumn, Column,OneToMany} from "typeorm";
import { Url } from "./Url";

@Entity('user')
export class User {

    @PrimaryGeneratedColumn('uuid')
    public id?: string;

    @Column({unique:true})
    public userName!: string;

    @Column()
    public password!: string;

    @OneToMany(()=>Url,(url)=>url.user)
    public url!:Url[]

}
