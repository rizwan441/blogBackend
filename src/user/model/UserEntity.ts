import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserRole } from "./userInterface";




@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    name:string;
    @Column({unique:true})
    username:string;
    @Column({unique:true})
    email?:string;
    @Column()
    password:string

    @BeforeInsert()
    emailtoLowercase(){
        this.email = this.email.toLowerCase()
    }
    @Column({type:"enum",enum:UserRole,default:UserRole.USER})
    role:UserRole

}