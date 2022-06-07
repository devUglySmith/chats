import { getRepository } from "typeorm";
import { MemberEntity } from "./entities/member.entity";

export class memberRepository {
  public async getOneRow(user: string) {
    return await getRepository(MemberEntity).findOne({ where: { mbId: user } });
  }
}
