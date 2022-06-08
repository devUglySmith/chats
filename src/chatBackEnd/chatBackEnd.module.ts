import { Module } from "@nestjs/common";
import { ChatBackEndGateway } from "./chatBackEnd.gateway";
import { ChatRoomService } from "./chatRoom.service";
import { ChatBackEndController } from "./chatBackEnd.controller";
import { MulterModule } from "@nestjs/platform-express";
import { MemberRepository } from "../repositories/member.repository";
import { ChatListRepository } from "../repositories/chatList.repository";
import { ChatMemberRepository } from "../repositories/chatMember.repository";
import { ChatMessageRepository } from "../repositories/chatMessage.repository";
import { ChatFileRepository } from "../repositories/chatFile.repository";

@Module({
  imports: [
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
    ChatMemberRepository,
    ChatListRepository,
    ChatMessageRepository,
    ChatFileRepository,
  ],
  controllers: [ChatBackEndController],
})
export class ChatBackEndModule {}
