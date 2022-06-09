import { getRepository } from "typeorm";
import { ChatStatusEntity } from "./entities/chatStatus.entity";

export class ChatStatusRepository {
  public async getOneRow(roomId, clientId) {
    return await getRepository(ChatStatusEntity).findOne({
      where: { chatNo: roomId, mbNo: clientId },
    });
  }
  public async insertRow(userReadData) {
    return await getRepository(ChatStatusEntity).save(userReadData);
  }
}
