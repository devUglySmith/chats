import { getRepository } from "typeorm";
import { MemberEntity } from "./entities/member.entity";

export class MemberRepository {
  public async getOneRow(user: string) {
    return await getRepository(MemberEntity).findOne({ where: { mbId: user } });
  }

  public async getAllRow({ select, where }) {
    return await getRepository(MemberEntity).find({
      select: select,
      where: where,
    });
  }
}
