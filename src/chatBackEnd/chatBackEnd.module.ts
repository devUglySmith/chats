import { Module } from '@nestjs/common';
import { ChatBackEndGateway } from './chatBackEnd.gateway';
import { ChatRoomService } from './chatRoom.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MemberEntity } from "../entities/member.entity";
import {ChatListEntity} from "../entities/chatList.entity";
import {ChatMemberEntity} from "../entities/chatMember.entity";

@Module({
    imports:[TypeOrmModule.forFeature([MemberEntity, ChatListEntity, ChatMemberEntity])],
    providers: [ChatBackEndGateway, ChatRoomService],
})
export class ChatBackEndModule {}
