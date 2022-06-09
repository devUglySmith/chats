import { getRepository } from "typeorm";
import { ChatFilesEntity } from "./entities/chatFiles.entity";

export class ChatFileRepository {
  public async insertRow(fileArr) {
    return await getRepository(ChatFilesEntity).save(fileArr);
  }
  public async joinRow(roomId: number) {
    return getRepository(ChatFilesEntity)
      .createQueryBuilder("file")
      .where(`file.chatNo=${roomId}`)
      .select([
        "file.cfNo AS fileId",
        "file.cfFile AS message",
        "file.cfRegdate AS messageDate",
        "member.mbId AS id",
        "member.mbName AS nickname",
        "file.cfType AS file",
      ])
      .leftJoin("file.mbNo2", "member")
      .orderBy("messageDate")
      .getQuery();
  }
}
