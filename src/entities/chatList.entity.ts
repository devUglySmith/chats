import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatFilesEntity } from "./chatFiles.entity";
import { ChatMemberEntity } from "./chatMember.entity";
import { ChatMessageEntity } from "./chatMessage.entity";

@Entity("aaaa__chat_list", { schema: "chattalk" })
export class ChatListEntity {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "chat_no",
    comment: "????__chat_list ID",
  })
  chatNo: number;

  @Column("text", {
    name: "chat_room",
    comment: "channel 명 ????_chat_list ID + centerCd",
  })
  chatRoom: string;

  @Column("char", {
    name: "chat_display",
    comment: "노출설정",
    length: 1,
    default: () => "'Y'",
  })
  chatDisplay: string;

  @Column("char", { name: "chat_delyn", comment: "삭제여부", length: 1 , default: ()=> "'N'"})
  chatDelyn: string;

  @Column("datetime", {
    name: "chat_regdate",
    comment: "등록일",
    default: () => "CURRENT_TIMESTAMP",
  })
  chatRegdate: Date;

  @OneToMany(() => ChatFilesEntity, (aaaaChatFiles) => aaaaChatFiles.chatNo2)
  aaaaChatFiles: ChatFilesEntity[];

  @OneToMany(() => ChatMemberEntity, (aaaaChatMember) => aaaaChatMember.chatNo2)
  aaaaChatMembers: ChatMemberEntity[];

  @OneToMany(
    () => ChatMessageEntity,
    (aaaaChatMessage) => aaaaChatMessage.chatNo2
  )
  aaaaChatMessages: ChatMessageEntity[];
}
