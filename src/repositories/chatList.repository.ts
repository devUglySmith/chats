import { getRepository } from "typeorm";
import { ChatListEntity } from "./entities/chatList.entity";
import { ChatListDto } from "../events/dto/chatList.dto";

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
  public async updateRow(roomName: ChatListDto, chatNo) {
    return await getRepository(ChatListEntity)
      .createQueryBuilder()
      .update()
      .set(roomName)
      .where("chatNo=:chatNo", { chatNo })
      .execute();
  }
}
