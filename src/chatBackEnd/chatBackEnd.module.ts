import { Module } from '@nestjs/common';
import { ChatBackEndGateway } from './chatBackEnd.gateway';
import { ChatRoomService } from './chatRoom.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MemberEntity } from "../entities/member.entity";

@Module({
    imports:[TypeOrmModule.forFeature([MemberEntity])],
    providers: [ChatBackEndGateway, ChatRoomService],
})
export class ChatBackEndModule {}
