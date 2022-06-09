import { Module } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { MulterModule } from "@nestjs/platform-express";
import { MemberRepository } from "../repositories/member.repository";
import { ChatListRepository } from "../repositories/chatList.repository";
import { ChatMemberRepository } from "../repositories/chatMember.repository";
import { ChatMessageRepository } from "../repositories/chatMessage.repository";
import { ChatFileRepository } from "../repositories/chatFile.repository";
import { Helpers } from "../common/helper/helpers";
import { ChatStatusRepository } from "../repositories/chatStatus.repository";

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: "./upload",
      }),
    }),
  ],
  providers: [
    EventsGateway,
    EventsService,
    MemberRepository,
    ChatMemberRepository,
    ChatListRepository,
    ChatMessageRepository,
    ChatFileRepository,
    ChatStatusRepository,
    Helpers,
  ],
  controllers: [EventsController],
})
export class EventsModule {}
