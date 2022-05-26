import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ChatListEntity } from "./chatList.entity";
import { MemberEntity } from "./member.entity";

@Index("FK_aaaa__member_TO_aaaa__chat_member_1", ["mbNo"], {})
@Entity("aaaa__chat_member", { schema: "chattalk" })
export class ChatMemberEntity {
  @Column("int", {
    primary: true,
    name: "chat_no",
    comment: "????__chat_list ID",
  })
  chatNo: number;

  @Column("int", {
    primary: true,
    name: "mb_no",
    comment: "컨설턴트&일반관리자&내담자 키",
  })
  mbNo: number;

  @Column("datetime", {
    name: "chat_regdate",
    nullable: true,
    comment: "등록일",
    default: () => "CURRENT_TIMESTAMP",
  })
  chatRegdate: Date | null;

  @ManyToOne(
    () => ChatListEntity,
    (aaaaChatList) => aaaaChatList.aaaaChatMembers,
    { onDelete: "RESTRICT", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "chat_no", referencedColumnName: "chatNo" }])
  chatNo2: ChatListEntity;

  @ManyToOne(() => MemberEntity, (aaaaMember) => aaaaMember.aaaaChatMembers, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "mb_no", referencedColumnName: "mbNo" }])
  mbNo2: MemberEntity;
}
