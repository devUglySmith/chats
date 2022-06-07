import { getRepository } from "typeorm";
import { ChatListEntity } from "./entities/chatList.entity";
import { ChatListDto } from "../chatBackEnd/dto/chatList.dto";

export class ChatListRepository {
  public async getChatListRow(chatNoArr: Array<object>) {
    return await getRepository(ChatListEntity).find({
      select: ["chatNo", "chatRoom"],
      where: chatNoArr,
    });
  }
  public async insertRow(roomName: ChatListDto) {
    return await getRepository(ChatListEntity).save(roomName);
  }
}
