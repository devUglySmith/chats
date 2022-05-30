import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { ChatMemberEntity } from "./chatMember.entity";
import { ChatMessageEntity } from "./chatMessage.entity";
import {ChatFilesEntity} from "./chatFiles.entity";

@Entity("aaaa__member", { schema: "chattalk" })
export class MemberEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "mb_no" })
  mbNo: number;

  @Column("varchar", { name: "mb_id", comment: "아이디", length: 200 })
  mbId: string;

  @Column("varchar", { name: "mb_name", comment: "이름", length: 20 })
  mbName: string;

  @Column("varchar", { name: "mb_password", comment: "패스워드", length: 255 })
  mbPassword: string;

  @Column("varchar", { name: "mb_hp", comment: "연락처", length: 255 })
  mbHp: string;

  @Column("varchar", { name: "mb_email", comment: "이메일", length: 255 })
  mbEmail: string;

  @Column("text", { name: "mb_memo", nullable: true, comment: "회원메모" })
  mbMemo: string | null;

  @Column("varchar", {
    name: "mb_grade",
    nullable: true,
    comment: "직위",
    length: 30,
  })
  mbGrade: string | null;

  @Column("int", {
    name: "mb_level",
    comment: "권한 : 1-10",
    default: () => "'1'",
  })
  mbLevel: number;

  @Column("varchar", { name: "mb_ip", comment: "접속ip", length: 20 })
  mbIp: string;

  @Column("varchar", {
    name: "mb_leave_data",
    nullable: true,
    comment: "탈퇴날짜",
    length: 30,
  })
  mbLeaveData: string | null;

  @Column("varchar", {
    name: "mb_leave_memo",
    nullable: true,
    comment: "탈퇴사유",
    length: 255,
  })
  mbLeaveMemo: string | null;

  @Column("varchar", {
    name: "mb_ch_session",
    nullable: true,
    comment: "비밀번호키",
    length: 150,
  })
  mbChSession: string | null;

  @Column("varchar", {
    name: "mb_img",
    nullable: true,
    comment: "프로필",
    length: 200,
  })
  mbImg: string | null;

  @Column("varchar", {
    name: "mb_img_ori",
    nullable: true,
    comment: "프로필",
    length: 200,
  })
  mbImgOri: string | null;

  @Column("char", {
    name: "mb_sms",
    comment: "sns 수신",
    length: 1,
    default: () => "'N'",
  })
  mbSms: string;

  @Column("char", {
    name: "mb_push",
    comment: "앱알림 여부",
    length: 1,
    default: () => "'N'",
  })
  mbPush: string;

  @Column("char", {
    name: "mb_auto_push",
    comment: "앱푸시 일정 자동 알림",
    length: 1,
    default: () => "'Y'",
  })
  mbAutoPush: string;

  @Column("varchar", {
    name: "mb_status",
    comment: "컨설턴트 : 재직,휴무,퇴사  내담자 : 승인,거절",
    length: 10,
  })
  mbStatus: string;

  @Column("varchar", {
    name: "mb_login_date",
    nullable: true,
    comment: "로그인시간",
    length: 50,
  })
  mbLoginDate: string | null;

  @Column("char", {
    name: "mb_delyn",
    comment: "삭제",
    length: 1,
    default: () => "'N'",
  })
  mbDelyn: string;

  @CreateDateColumn({
    name: "mb_date",
    comment: "가입일",
    default: () => "CURRENT_TIMESTAMP",
  })
  mbDate: Date;

  @OneToMany(() => ChatMemberEntity, (aaaaChatMember) => aaaaChatMember.mbNo2)
  aaaaChatMembers: ChatMemberEntity[];

  @OneToMany(() => ChatMessageEntity, (aaaaChatMessage) => aaaaChatMessage.mbNo2)
  aaaaChatMessages: ChatMessageEntity[];

  @OneToMany(() => ChatFilesEntity, (aaaaChatFiles) => aaaaChatFiles.mbNo2)
  aaaaChatFiles: ChatFilesEntity[];
}
