import { Injectable } from '@nestjs/common';
import { chatRoomListDTO } from './dto/chatBackEnd.dto';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MemberEntity } from "../entities/member.entity";

@Injectable()
export class ChatRoomService {
    private readonly chatRoomList: Record<string, chatRoomListDTO>;
    constructor(@InjectRepository(MemberEntity) private memberRepository:Repository<MemberEntity>) {
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
    createChatRoom(client: Socket, roomName: string): void {
        const roomId = `room:${uuidv4()}`;
        const nickname: string = client.data.nickname;
        client.emit('getMessage', {
            id: null,
            nickname: '안내',
            message:
                '"' + nickname + '"님이 "' + roomName + '"방을 생성하였습니다.',
        });
        // return this.chatRoomList[roomId];
        this.chatRoomList[roomId] = {
            roomId,
            cheifId: client.id,
            roomName,
        };
        client.data.roomId = roomId;
        client.rooms.clear();
        client.join(roomId);
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

    getChatRoomList(): Record<string, chatRoomListDTO> {
        return this.chatRoomList;
    }

    deleteChatRoom(roomId: string) {
        delete this.chatRoomList[roomId];
    }
}
