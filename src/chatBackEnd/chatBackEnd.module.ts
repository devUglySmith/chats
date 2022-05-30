import { Module } from "@nestjs/common";
import { ChatBackEndGateway } from "./chatBackEnd.gateway";
import { ChatRoomService } from "./chatRoom.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MemberEntity } from "../database/entities/member.entity";
import { ChatListEntity } from "../database/entities/chatList.entity";
import { ChatMemberEntity } from "../database/entities/chatMember.entity";
import { ChatMessageEntity } from "../database/entities/chatMessage.entity";
import { ChatBackEndController } from "./chatBackEnd.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemberEntity,
      ChatListEntity,
      ChatMemberEntity,
      ChatMessageEntity,
    ]),
  ],
  providers: [ChatBackEndGateway, ChatRoomService],
  controllers: [ChatBackEndController],
})
export class ChatBackEndModule {}
