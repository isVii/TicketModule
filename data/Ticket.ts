import { BaseModel, BeforeInsert, Column, Entity, Generate, PrimaryColumn } from '@discord-factory/storage'

@Entity()
export default class Ticket extends BaseModel {
    @PrimaryColumn()
    public id!: string

    @Column()
    public userId!: string

    @Column()
    public channel!: string

    @BeforeInsert()
    private generateUUID () {
        this.id = Generate.generateUUID()
    }
}