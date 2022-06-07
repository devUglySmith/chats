import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { InjectRepository } from "@nestjs/typeorm";
import { getManager, getRepository, In, Not, Repository } from "typeorm";
import { MemberEntity } from "../repositories/entities/member.entity";
import { ChatListEntity } from "../repositories/entities/chatList.entity";
import { ChatMemberEntity } from "../repositories/entities/chatMember.entity";
import { ChatMessageEntity } from "../repositories/entities/chatMessage.entity";
import { ChatFilesEntity } from "../repositories/entities/chatFiles.entity";

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(ChatListEntity)
    private chatListRepository: Repository<ChatListEntity>,
    @InjectRepository(ChatMemberEntity)
    private chatMemberRepository: Repository<ChatMemberEntity>,
    @InjectRepository(ChatMessageEntity)
    private chatMessageRepository: Repository<ChatMessageEntity>,
    @InjectRepository(ChatFilesEntity)
    protected chatFileRepository: Repository<ChatFilesEntity>
  ) {}

  // 유저 정보 가져오기
  async getMemberList(user: string) {
    // [SELECT] => 유저 정보 가져오기
    return await this.memberRepository.findOne({ where: { mbId: user } });
  }

  // 나를 제외한 모든 유저 정보 가져오기
  async getAllMemberList(id: number) {
    // [SELECT] => 나를 제외한 모든 유저 정보 가져오기
    return await this.memberRepository.find({
      select: ["mbNo", "mbId", "mbName"],
      where: {
        mbId: Not(id),
      },
    });
  }

  // 채팅방 생성하기
  async createChatRoom(client, { userList }) {
    // 나를 포함한 초대된 유저들
    userList.push(client.data.no);

    let roomName;
    const userNameArr = [];
    const chatListArr = [];

    // [SELECT] => 초대를 한 유저리스트 불러오기
    const userData = await this.memberRepository.find({
      select: ["mbNo", "mbName"],
      where: {
        mbNo: In(userList),
      },
    });

    // 채팅방 이름을 만들어주기 위한 배열 삽입
    userData.forEach((data) => {
      userNameArr.push(data.mbName);
    });

    // 방 이름을 문자열로 만들기
    roomName = userNameArr.join();

    // [INSERT] => 채팅방 생성
    const chatList = await this.chatListRepository.save({
      chatRoom: roomName,
    });

    // 채팅방 속한 멤버 배열
    for (const data of userData) {
      chatListArr.push({ chatNo: chatList.chatNo, mbNo: data.mbNo });
    }

    // [INSERT] => 채팅방에 속한 유저 저장
    await this.chatMemberRepository.save(chatListArr);

    // 실시간으로 채팅방 리스트를 초대된 유저와 나에게 전달
    for (const data of userData) {
      const members = await this.getChatRoomList(data.mbNo);

      // setInit에서 join한 유저들 중 초대된 사람에게 전달
      client.to(data.mbNo).emit("getNewChatList", members);
    }
  }

  //내가 속한 채팅방 가져오기
  async getChatRoomList(clientNo) {
    let chatNoArr = [];
    // [SELECT] => 내가 속한 채팅방 번호 가져오기
    const chatNo = await this.chatMemberRepository.find({
      select: ["chatNo"],
      where: { mbNo: clientNo },
    });

    if (!chatNo.length) {
      return false;
    }

    chatNo.forEach((data) => {
      // 채팅방 정보 가져오기 위한 배열 생성
      chatNoArr.push({ chatNo: data.chatNo, chatDisplay: "Y", chatDelyn: "N" });
    });

    // [SELECT] => 채팅방 가져오기
    return await this.chatListRepository.find({
      select: ["chatNo", "chatRoom"],
      where: chatNoArr,
    });
  }

  // 채팅방 입장
  async enterChatRoom(client: Socket, roomId) {
    client.data.roomId = roomId;
    client.rooms.clear();
    client.join(roomId);
    const entityManager = getManager();

    // [SELECT] => 채팅 기록, 유저 정보 가져오기
    const message = getRepository(ChatMessageEntity)
      .createQueryBuilder("chat")
      .where(`chat.chatNo=${roomId}`)
      .andWhere("chat.cmDelyn='N'")
      .select([
        "chat.cmContent AS message",
        "chat.cmRegdate AS messageDate",
        "member.mbId AS id",
        "member.mbName AS nickname",
        "chat.cmType AS file",
      ])
      .leftJoin("chat.mbNo2", "member")
      .getQuery();

    const file = getRepository(ChatFilesEntity)
      .createQueryBuilder("file")
      .where(`file.chatNo=${roomId}`)
      .select([
        "file.cfFile AS message",
        "file.cfRegdate AS messageDate",
        "member.mbId AS id",
        "member.mbName AS nickname",
        "file.cfType AS file",
      ])
      .leftJoin("file.mbNo2", "member")
      .orderBy("messageDate")
      .getQuery();

    return await entityManager.query(`${message} UNION ${file}`);
  }

  exitChatRoom(client: Socket, roomId: string) {
    client.data.roomId = `room:lobby`;
    client.rooms.clear();
    client.join(`room:lobby`);
    const { nickname } = client.data;
    client.to(roomId).emit("getMessage", {
      id: null,
      nickname: "안내",
      message: '"' + nickname + '"님이 방에서 나갔습니다.',
    });
  }

  //내가 속한 방에 메세지 생성 및 전달
  // sendInfo : 방 No, 메세지
  async createChatMessage(client, sendInfo) {
    const chatData = {
      cmContent: sendInfo.message,
      chatNo: sendInfo.chatNo,
      mbNo: client.data.no,
    };
    // [INSERT] => 채팅 저장
    const chatMessage = await this.chatMessageRepository.save(chatData);

    //해당 방에 속한 모든 유저에게 메세지 전달
    client.to(sendInfo.chatNo).emit("getMessage", [
      {
        id: client.data.id,
        nickname: client.data.nickname,
        message: sendInfo.message,
        messageDate: chatMessage.cmRegdate,
        file: false,
      },
    ]);
  }

  async createUploadFiles(files, userData) {
    console.log(userData);
    const fileArr = [];
    files.forEach((data) => {
      fileArr.push({
        cfFile: data.filename,
        cfFileOri: data.originalname,
        cfFileExt: data.mimetype,
        cfSize: data.size,
        chatNo: userData[3],
        mbNo: userData[1],
      });
    });
    return await this.chatFileRepository.save(fileArr);
  }

  deleteChatRoom(roomId: string) {}
}
