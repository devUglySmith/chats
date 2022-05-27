import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatRoomService } from './chatRoom.service';
import { setInitDTO } from './dto/chatBackEnd.dto';

@WebSocketGateway(8080, {
    cors: {
        // origin: 'http://chattalk.uglysmith.co.kr',
        credentials : true
    },
})
export class ChatBackEndGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    constructor(private readonly ChatRoomService: ChatRoomService) {}
    @WebSocketServer()
    server: Server;

    //소켓 연결시 유저목록에 추가
    public handleConnection(client: Socket) {
        console.log('connected', client.id);
        client.leave(client.id);
        client.data.roomId = `room:lobby`;
        client.join('room:lobby');


    }

    //소켓 연결 해제시 유저목록에서 제거
    public handleDisconnect(client: Socket) {
        const { roomId } = client.data;
        if (
            roomId != 'room:lobby' &&
            !this.server.sockets.adapter.rooms.get(roomId)
        ) {
            this.ChatRoomService.deleteChatRoom(roomId);
            this.server.emit(
                'getChatRoomList',
                this.ChatRoomService.getChatRoomList(client.data.no),
            );
        }
        console.log('disonnected', client.id);
    }

    //메시지가 전송되면 모든 유저에게 메시지 전송
    @SubscribeMessage('sendMessage')
    async sendMessage(client: Socket, sendInfo) {
        console.log(sendInfo);

        await this.ChatRoomService.createChatMessage(client,sendInfo);

    }

    //처음 접속시 닉네임 등 최초 설정 , 참여한 채팅방 리스트 불러오기
    @SubscribeMessage('setInit')
    async setInit(client: Socket, data: setInitDTO) {
        // 이미 최초 세팅이 되어있는 경우 패스
        if (client.data.isInit) {
            return;
        }

        const user = await this.ChatRoomService.getMemberList(data.userId);
        // console.log(user);

        if(!user) return false;

        client.data.no = user.mbNo
        client.data.id = user.mbId
        client.data.nickname = user.mbName
        client.data.isInit = true;

        const roomList = await this.ChatRoomService.getChatRoomList(client.data.no);
        // console.log(roomList);

        client.join(client.data.no);

        return {
            name: user.mbName,
            id:user.mbId,
            room: roomList,
        };
    }

    //채팅방 목록 가져오기
    @SubscribeMessage('getChatRoomList')
    async getChatRoomList(client: Socket, payload: any) {
        client.emit('getChatRoomList', await this.ChatRoomService.getChatRoomList(client.data.no));
    }

    //채팅방 생성하기
    @SubscribeMessage('createChatRoom')
     async createChatRoom(client: Socket, userList) {
        await this.ChatRoomService.createChatRoom(client, {userList})
        return  await this.ChatRoomService.getChatRoomList(client.data.no);
    }

    //채팅방 들어가기
    @SubscribeMessage('enterChatRoom')
     async enterChatRoom(client: Socket, roomId: string) {
        //이미 접속해있는 방 일 경우 재접속 차단
        if (client.rooms.has(roomId)) {
            return;
        }


        return await this.ChatRoomService.enterChatRoom(client, roomId);
    }

    // 채팅방에 초대할 유저목록 get
    @SubscribeMessage('inviteUsers')
    selectInviteUser(client:Socket){
        return this.ChatRoomService.getAllMemberList(client.data.id);
    }

}
