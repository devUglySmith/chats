import { Injectable } from '@nestjs/common';
import { chatRoomListDTO } from './dto/chatBackEnd.dto';
import { Socket } from 'socket.io';
import { InjectRepository } from "@nestjs/typeorm";
import { getRepository, In, Not, Repository } from "typeorm";
import { MemberEntity } from "../entities/member.entity";
import {ChatListEntity} from "../entities/chatList.entity";
import {ChatMemberEntity} from "../entities/chatMember.entity";
import { ChatMessageEntity } from "../entities/chatMessage.entity";

@Injectable()
export class ChatRoomService {
    private readonly chatRoomList: Record<string, chatRoomListDTO>;
    constructor(@InjectRepository(MemberEntity) private memberRepository:Repository<MemberEntity>,
                @InjectRepository(ChatListEntity) private chatListRepository:Repository<ChatListEntity>,
                @InjectRepository(ChatMemberEntity) private chatMemberRepository:Repository<ChatMemberEntity>,
                @InjectRepository(ChatMessageEntity) private chatMessageRepository:Repository<ChatMessageEntity>) {
        this.chatRoomList = {
            'room:lobby': {
                roomId: 'room:lobby',
                roomName: '로비',
                cheifId: null,
            },
        };
    }

    async getMemberList(user:string){
        return await this.memberRepository.findOne({where:{mbId:user}});
    }

    async getAllMemberList(id:number){
        return await this.memberRepository.find({
            select:[
                "mbNo",
                "mbId",
                "mbName"
            ],
            where:{
                mbId : Not(id)
            },
        });
    }

    async createChatRoom(client, {userList}) {

        userList.push(client.data.no);

        let roomName;
        const userNameArr = [];
        const chatListArr = [];

        // [SELECT] => 초대를 한 유저리스트 불러오기
        const userData = await this.memberRepository.find({
            select: [
                "mbNo",
                "mbName"
            ],
            where:{
                mbNo: In(userList)
            }
        })

        // 채팅방 이름을 만들어주기 위한 배열 삽입
        userData.forEach(data=>{
            userNameArr.push(data.mbName)
        })

        // 방 이름을 문자열로 만들기
        roomName = userNameArr.join();

        // [INSERT] => 채팅방 생성
        const chatList = await this.chatListRepository.save({
            chatRoom : roomName
        });

        // 채팅방 속한 멤버 배열
        userData.forEach(data=>{
            chatListArr.push({'chatNo': chatList.chatNo, 'mbNo': data.mbNo});
        })

        // [INSERT] => 채팅방에 속한 유저 저장
        await this.chatMemberRepository.save(chatListArr);


    }

    async getChatRoomList(client) {
        //내가 속한 채팅방 가져오기
        let chatNoArr = [];
        const chatNo = await this.chatMemberRepository.find({select:["chatNo"],where:{mbNo:client.data.no}});

        chatNo.forEach(data=>{
            chatNoArr.push({'chatNo':data.chatNo,'chatDisplay':'Y','chatDelyn':'N'})
        })

        return await this.chatListRepository.find({select:["chatNo",'chatRoom'],where: chatNoArr})

    }

    async enterChatRoom(client: Socket, roomId) {
        client.data.roomId = roomId;
        client.rooms.clear();
        client.join(roomId);

        // const chatMessage = await this.chatMessageRepository.find({select:['cmContent','cmRegdate','mbNo'],where:{chatNo:roomId,cmDelyn:'N'},order:{cmRegdate:'DESC'},relations:['mbNo2.mbName']})

        const chatMessage = await getRepository(ChatMessageEntity).createQueryBuilder('chat')
          .where('chat.chatNo=:roomId',{roomId:roomId})
          .andWhere('chat.cmDelyn=:cmDelYn',{cmDelYn:'N'})
          .select(["chat.cmContent AS message","chat.cmRegdate AS messageDate","chat.mbNo AS id","member.mbName AS nickname"])
          .leftJoin('chat.mbNo2','member')
          .getRawMany();
        console.log(chatMessage);

        return chatMessage;
    }

    exitChatRoom(client: Socket, roomId: string) {
        client.data.roomId = `room:lobby`;
        client.rooms.clear();
        client.join(`room:lobby`);
        const { nickname } = client.data;
        client.to(roomId).emit('getMessage', {
            id: null,
            nickname: '안내',
            message: '"' + nickname + '"님이 방에서 나갔습니다.',
        });
    }

    async createChatMessage(client,sendInfo){

        const chatData = {'cmContent':sendInfo.message,'chatNo':sendInfo.chatNo,'mbNo':client.data.no}
        const chatMessage = await this.chatMessageRepository.save(chatData);

        client.to(sendInfo.chatNo).emit('getMessage', [{
            id: client.data.id,
            nickname: client.data.nickname,
            message: sendInfo.message,
            messageDate:chatMessage.cmRegdate
        }]);
    }



    deleteChatRoom(roomId: string) {
        delete this.chatRoomList[roomId];
    }
}
