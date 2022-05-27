import {
  Column, CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChatListEntity } from "./chatList.entity";
import { MemberEntity } from "./member.entity";

@Index("FK_aaaa__chat_list_TO_aaaa__chat_message_1", ["chatNo"], {})
@Index("FK_aaaa__member_TO_aaaa__chat_message_1", ["mbNo"], {})
@Entity("aaaa__chat_message", { schema: "chattalk" })
export class ChatMessageEntity {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "cm_no",
    comment: "????__chat_message ID",
  })
  cmNo: number;

  @Column("text", { name: "cm_content", nullable: true, comment: "전달내용" })
  cmContent: string | null;

  @Column("char", {
    name: "cm_delyn",
    comment: "삭제여부",
    length: 1,
    default: () => "'N'",
  })
  cmDelyn: string;

  @CreateDateColumn( {
    name: "cm_regdate",
    comment: "등록일",
    default: () => "CURRENT_TIMESTAMP",
  })
  cmRegdate: Date;

  @Column("int", { name: "chat_no", comment: "????__chat_list ID" })
  chatNo: number;

  @Column("int", { name: "mb_no", comment: "메세지보낸사람" })
  mbNo: number;

  @ManyToOne(
    () => ChatListEntity,
    (aaaaChatList) => aaaaChatList.aaaaChatMessages,
    { onDelete: "RESTRICT", onUpdate: "RESTRICT" }
  )
  @JoinColumn([{ name: "chat_no", referencedColumnName: "chatNo" }])
  chatNo2: ChatListEntity;

  @ManyToOne(() => MemberEntity, (aaaaMember) => aaaaMember.aaaaChatMessages, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "mb_no", referencedColumnName: "mbNo" }])
  mbNo2: MemberEntity;
}
