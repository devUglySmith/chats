import { ChatMessageDto } from "../events/dto/chatMessage.dto";
import { getRepository } from "typeorm";
import { ChatMessageEntity } from "./entities/chatMessage.entity";

export class ChatMessageRepository {
  public async insertRow(chatData: ChatMessageDto) {
    return await getRepository(ChatMessageEntity).save(chatData);
  }

  public async joinRow(roomId: number) {
    return getRepository(ChatMessageEntity)
      .createQueryBuilder("chat")
      .where(`chat.chatNo=${roomId}`)
      .andWhere("chat.cmDelyn='N'")
      .select([
        "chat.cmContent AS message",
        "chat.cmRegdate AS messageDate",
        "member.mbId AS id",
        "member.mbName AS nickname",
        "chat.cmType AS file",
      ])
      .leftJoin("chat.mbNo2", "member")
      .getQuery();
  }
}
