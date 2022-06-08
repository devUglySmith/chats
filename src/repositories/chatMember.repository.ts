import { getRepository, Not } from "typeorm";
import { ChatMemberEntity } from "./entities/chatMember.entity";

export class ChatMemberRepository {
  public async getAllJoinRoomNumberRow(clientId: number) {
    return await getRepository(ChatMemberEntity).find({
      select: ["chatNo"],
      where: { mbNo: clientId },
    });
  }

  public async getUserRow(roomId, clientId) {
    return await getRepository(ChatMemberEntity).find({
      select: ["mbNo"],
      where: { chatNo: roomId, mbNo: Not(clientId) },
    });
  }

  public async inertRow(chatListUsers: Array<object>) {
    return await getRepository(ChatMemberEntity).save(chatListUsers);
  }
}
