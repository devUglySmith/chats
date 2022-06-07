import { getRepository, In, Not } from "typeorm";
import { MemberEntity } from "./entities/member.entity";

export class MemberRepository {
  public async getOneRow(user: string) {
    return await getRepository(MemberEntity).findOne({ where: { mbId: user } });
  }

  public async getAllInviteUsersRow(clientId: number) {
    return await getRepository(MemberEntity).find({
      select: ["mbNo", "mbId", "mbName"],
      where: {
        mbId: Not(clientId),
      },
    });
  }

  public async getAllUsersRow(userList: Array<string>) {
    return await getRepository(MemberEntity).find({
      select: ["mbNo", "mbName"],
      where: {
        mbNo: In(userList),
      },
    });
  }
}
