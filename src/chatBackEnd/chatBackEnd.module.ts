import { Module } from "@nestjs/common";
import { ChatBackEndGateway } from "./chatBackEnd.gateway";
import { ChatRoomService } from "./chatRoom.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatListEntity } from "../repositories/entities/chatList.entity";
import { ChatMemberEntity } from "../repositories/entities/chatMember.entity";
import { ChatMessageEntity } from "../repositories/entities/chatMessage.entity";
import { ChatBackEndController } from "./chatBackEnd.controller";
import { MulterModule } from "@nestjs/platform-express";
import { ChatFilesEntity } from "../repositories/entities/chatFiles.entity";
import { MemberRepository } from "../repositories/member.repository";
import { ChatListRepository } from "../repositories/chatList.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatListEntity,
      ChatMemberEntity,
      ChatMessageEntity,
      ChatFilesEntity,
    ]),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: "./upload",
      }),
    }),
  ],
  providers: [
    ChatBackEndGateway,
    ChatRoomService,
    MemberRepository,
    ChatListRepository,
  ],
  controllers: [ChatBackEndController],
})
export class ChatBackEndModule {}
