import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { CommunityMessageService } from './community-message.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class CommunityChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: CommunityMessageService) {}

  @SubscribeMessage('joinCommunity')
  async joinCommunity(
    @ConnectedSocket() client: Socket,
    @MessageBody() communityId: number,
  ) {
    client.join(`community_${communityId}`);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      communityId: number;
      customerId: number;
      message: string;
    },
  ) {
    const msg = await this.chatService.sendMessage(
      data.customerId,
      data.communityId,
      data.message,
    );

    this.server.to(`community_${data.communityId}`).emit('newMessage', msg);
  }
}

// import {
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
//   MessageBody,
//   ConnectedSocket
// } from '@nestjs/websockets';

// import { Server, Socket } from "socket.io";
// import { CommunityMessageService } from './community-message.service';

// @WebSocketGateway({
//   cors: { origin: "*" }
// })
// export class CommunityChatGateway {
    
//     @WebSocketServer()
//     server: Server;

//     constructor(private chatService: CommunityMessageService) {}

//     @SubscribeMessage('joinCommunity')
//     async joinCommunity(
//         @ConnectedSocket() client: Socket,
//         @MessageBody() communityId: number
//     ) {
//         client.join(`community_${communityId}`);
//     }

//     @SubscribeMessage('sendMessage')
//     async sendMessage(
//         @ConnectedSocket() client: Socket,
//         @MessageBody() data: { communityId: number, customerId: number, message: string }
//     ) {
//         const saved = await this.chatService.sendMessage(
//             data.customerId,
//             data.communityId,
//             data.message
//         );

//         this.server.to(`community_${data.communityId}`).emit('newMessage', saved);
//     }
// }
