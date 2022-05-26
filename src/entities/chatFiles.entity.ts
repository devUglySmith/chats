import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChatListEntity } from "./chatList.entity";

@Index("FK_aaaa__chat_list_TO_aaaa__chat_files_1", ["chatNo"], {})
@Entity("aaaa__chat_files", { schema: "chattalk" })
export class ChatFilesEntity {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "cf_no",
    comment: "ug_apps_files ID",
  })
  cfNo: number;

  @Column("varchar", { name: "cf_file", comment: "파일명", length: 150 })
  cfFile: string;

  @Column("varchar", { name: "cf_file_ori", comment: "파일명", length: 150 })
  cfFileOri: string;

  @Column("varchar", { name: "cf_file_ext", comment: "확장자", length: 5 })
  cfFileExt: string;

  @Column("varchar", {
    name: "cf_size",
    nullable: true,
    comment: "파일사이즈",
    length: 50,
  })
  cfSize: string | null;

  @Column("datetime", {
    name: "cf_stdate",
    nullable: true,
    comment: "유효기간",
  })
  cfStdate: Date | null;

  @Column("datetime", {
    name: "cf_endate",
    nullable: true,
    comment: "유효기간",
  })
  cfEndate: Date | null;

  @Column("datetime", {
    name: "cf_regdate",
    nullable: true,
    comment: "등록일",
    default: () => "CURRENT_TIMESTAMP",
  })
  cfRegdate: Date | null;

  @Column("int", { name: "chat_no", comment: "????__chat_list ID" })
  chatNo: number;

  @ManyToOne(() => ChatListEntity, (aaaaChatList) => aaaaChatList.aaaaChatFiles, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "chat_no", referencedColumnName: "chatNo" }])
  chatNo2: ChatListEntity;
}
