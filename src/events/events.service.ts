import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { EntityManager, getManager } from "typeorm";
import { ChatMemberEntity } from "../repositories/entities/chatMember.entity";
import { ChatMessageEntity } from "../repositories/entities/chatMessage.entity";
import { MemberRepository } from "../repositories/member.repository";
import { ChatListRepository } from "../repositories/chatList.repository";
import { ChatListEntity } from "../repositories/entities/chatList.entity";
import { ChatMemberRepository } from "../repositories/chatMember.repository";
import { ChatMessageRepository } from "../repositories/chatMessage.repository";
import { ChatFileRepository } from "../repositories/chatFile.repository";

@Injectable()
export class EventsService {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly chatMemberRepository: ChatMemberRepository,
    private readonly chatListRepository: ChatListRepository,
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly chatFileRepository: ChatFileRepository
  ) {}

  async getMember(user: string) {
    return await this.memberRepository.getOneRow(user);
  }

  async getMemberList(clientId: number, roomId: null | string) {
    let users;
    let inviteUser: Array<number> = [clientId];
    if (roomId) {
      users = await this.chatMemberRepository.getUserRow(roomId, clientId);
      for (const data of users) {
        inviteUser.push(data.mbNo);
      }
    }
    return await this.memberRepository.getUsersRow(inviteUser);
  }

  async getInviteMemberList(client, userList) {
    userList.push(client.data.no);
    return await this.memberRepository.getInviteUsersRow(userList);
  }

  async createChatMember(userData, chatRoom) {
    const chatList: Array<object> = [];

    for (const data of userData) {
      chatList.push({ chatNo: chatRoom.chatNo, mbNo: data.mbNo });
    }
    await this.chatMemberRepository.inertRow(chatList);
  }

  async createChatRoom(client, userData) {
    let roomName: string;
    const userName: Array<string> = [];

    for (const data of userData) {
      userName.push(data.mbName);
    }
    roomName = userName.join();

    const chatRoom: ChatListEntity = await this.chatListRepository.insertRow({
      chatRoom: roomName,
    });

    return chatRoom;
  }

  async updateChatRoom() {}

  async emitNewChatList(client, userData) {
    for (const data of userData) {
      const members = await this.getChatRoomList(data.mbNo);
      client.to(data.mbNo).emit("getNewChatList", members);
    }
  }

  async getChatRoomList(clientId) {
    const chatNoArr: Array<object> = [];
    const chatNo: ChatMemberEntity[] =
      await this.chatMemberRepository.getAllJoinRoomNumberRow(clientId);

    if (!chatNo.length) {
      return false;
    }

    chatNo.forEach((data) => {
      chatNoArr.push({ chatNo: data.chatNo, chatDisplay: "Y", chatDelyn: "N" });
    });

    return await this.chatListRepository.getChatListRow(chatNoArr);
  }

  async enterChatRoom(client: Socket, roomId) {
    client.data.roomId = roomId;

    client.rooms.clear();
    client.join(roomId);
    const entityManager: EntityManager = getManager();

    const message: string = await this.chatMessageRepository.joinRow(roomId);
    const file: string = await this.chatFileRepository.joinRow(roomId);

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

  async createChatMessage(client, sendInfo) {
    const chatData = {
      cmContent: sendInfo.message,
      chatNo: sendInfo.chatNo,
      mbNo: client.data.no,
    };
    const chatMessage: ChatMessageEntity =
      await this.chatMessageRepository.insertRow(chatData);

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
    return await this.chatFileRepository.insertRow(fileArr);
  }

  deleteChatRoom(roomId: string) {}
}
