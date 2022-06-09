import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ChatMessageEntity } from "./chatMessage.entity";
import { MemberEntity } from "./member.entity";

@Index("FK_aaaa__member_TO_aaaa_chat__status_1", ["mbNo"], {})
@Entity("aaaa__chat_status", { schema: "chattalk" })
export class ChatStatusEntity {
  @Column("int", {
    primary: true,
    name: "cm_no",
    comment: "????__chat_message ID",
  })
  cmNo: number;

  @Column("int", {
    primary: true,
    name: "mb_no",
    comment: "컨설턴트&일반관리자&내담자 키",
  })
  mbNo: number;

  @Column("datetime", {
    name: "cs_regdate",
    comment: "읽은 시간",
    default: () => "CURRENT_TIMESTAMP",
  })
  csRegdate: Date;

  @ManyToOne(
    () => ChatMessageEntity,
    (aaaaChatMessage) => aaaaChatMessage.aaaaChatStatus,
    { onDelete: "RESTRICT", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "cm_no", referencedColumnName: "cmNo" }])
  cmNo2: ChatMessageEntity;

  @ManyToOne(() => MemberEntity, (aaaaMember) => aaaaMember.aaaaChatStatus, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "mb_no", referencedColumnName: "mbNo" }])
  mbNo2: MemberEntity;
}
