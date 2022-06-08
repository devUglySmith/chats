import { getRepository, In } from "typeorm";
import { MemberEntity } from "./entities/member.entity";

export class MemberRepository {
  public async getOneRow(user: string) {
    return await getRepository(MemberEntity).findOne({ where: { mbId: user } });
  }

  public async getUsersRow(user: Array<number>) {
    return await getRepository(MemberEntity)
      .createQueryBuilder("member")
      .select(["member.mbNo", "member.mbId", "member.mbName"])
      .where(`member.mbNo NOT IN(:...user)`, { user: user })
      .getMany();
  }

  public async getInviteUsersRow(userList: Array<number>) {
    return await getRepository(MemberEntity).find({
      select: ["mbNo", "mbName"],
      where: {
        mbNo: In(userList),
      },
    });
  }
}
