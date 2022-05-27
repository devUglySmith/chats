import { Injectable } from '@nestjs/common';
import { chatRoomListDTO } from './dto/chatBackEnd.dto';
import { Socket } from 'socket.io';
import { InjectRepository } from "@nestjs/typeorm";
import {In, Not, Repository} from "typeorm";
import { MemberEntity } from "../entities/member.entity";
import {ChatListEntity} from "../entities/chatList.entity";
import {ChatMemberEntity} from "../entities/chatMember.entity";

@Injectable()
export class ChatRoomService {
    private readonly chatRoomList: Record<string, chatRoomListDTO>;
    constructor(@InjectRepository(MemberEntity) private memberRepository:Repository<MemberEntity>,
                @InjectRepository(ChatListEntity) private chatListRepository:Repository<ChatListEntity>,
                @InjectRepository(ChatMemberEntity) private chatMemberRepository:Repository<ChatMemberEntity>) {
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

    enterChatRoom(client: Socket, roomId: string) {
        client.data.roomId = roomId;
        client.rooms.clear();
        client.join(roomId);
        const { nickname } = client.data;
        const { roomName } = this.getChatRoom(roomId);
        client.to(roomId).emit('getMessage', {
            id: null,
            nickname: '안내',
            message: `"${nickname}"님이 "${roomName}"방에 접속하셨습니다.`,
        });
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

    getChatRoom(roomId: string): chatRoomListDTO {
        return this.chatRoomList[roomId];
    }



    deleteChatRoom(roomId: string) {
        delete this.chatRoomList[roomId];
    }
}
