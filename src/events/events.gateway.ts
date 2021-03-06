import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { EventsService } from "./events.service";
import { setInitDTO } from "./dto/chatBackEnd.dto";

@WebSocketGateway(8080, {
  cors: {
    // origin: 'http://chattalk.uglysmith.co.kr',
    credentials: true,
    allowEI03: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly ChatRoomService: EventsService) {}
  @WebSocketServer()
  server: Server;

  public handleConnection(client: Socket) {
    console.log("connected", client.id);
    client.leave(client.id);
  }

  public handleDisconnect(client: Socket) {
    console.log("disonnected", client.id);
  }

  @SubscribeMessage("sendMessage")
  async sendMessage(client: Socket, sendInfo) {
    await this.ChatRoomService.createChatMessage(client, sendInfo);
  }

  @SubscribeMessage("setInit")
  async setInit(client: Socket, data: setInitDTO) {
    if (client.data.isInit) {
      return;
    }

    const user = await this.ChatRoomService.getMember(data.userId);

    if (!user) return false;

    client.data.no = user.mbNo;
    client.data.id = user.mbId;
    client.data.nickname = user.mbName;
    client.data.isInit = true;

    const roomList = await this.ChatRoomService.getChatRoomList(client.data.no);
    client.join(client.data.no);

    return {
      no: user.mbNo,
      name: user.mbName,
      id: user.mbId,
      room: roomList,
    };
  }

  @SubscribeMessage("getChatRoomList")
  async getChatRoomList(client: Socket) {
    client.emit(
      "getChatRoomList",
      await this.ChatRoomService.getChatRoomList(client.data.no)
    );
  }

  @SubscribeMessage("createChatRoom")
  async createChatRoom(client: Socket, userList) {
    const userData = await this.ChatRoomService.getInviteMemberList(
      userList,
      client
    );

    const chatRoom = await this.ChatRoomService.createChatRoom(
      client,
      userData
    );
    await this.ChatRoomService.createChatMember(userData, chatRoom);
    await this.ChatRoomService.emitNewChatList(client, userData);
  }

  @SubscribeMessage("createChatMember")
  async createChatMember(client: Socket, { userList, roomId }) {
    const userData = await this.ChatRoomService.getInviteMemberList(userList);
    await this.ChatRoomService.createChatMember(userData, { chatNo: roomId });

    const inviteUsers = await this.ChatRoomService.getRoomInviteMemberList(
      roomId
    );
    await this.ChatRoomService.updateChatRoom(inviteUsers, roomId);
    await this.ChatRoomService.emitNewChatList(client, inviteUsers);
  }

  @SubscribeMessage("enterChatRoom")
  async enterChatRoom(client: Socket, roomId: string) {
    if (client.rooms.has(roomId)) {
      return;
    }

    return await this.ChatRoomService.enterChatRoom(client, roomId);
  }

  // TODO
  // 3.채팅 방 들어왔을때 메세지 별로 읽음 처리
  // 4.메세지 그려줄 때 몇명 안읽었는지 카운트 전달
  // 총 채팅방 멤버수 - 메세지ID가 상태_메세지ID 안에 있으면 카운트 = 해당 메세지의 안읽은 수

  @SubscribeMessage("getMemberList")
  async getMemberList(client: Socket, roomId: null | string) {
    return await this.ChatRoomService.getMemberList(client.data.no, roomId);
  }
}
