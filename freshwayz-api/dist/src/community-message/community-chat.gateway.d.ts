import { Server, Socket } from 'socket.io';
import { CommunityMessageService } from './community-message.service';
export declare class CommunityChatGateway {
    private chatService;
    server: Server;
    constructor(chatService: CommunityMessageService);
    joinCommunity(client: Socket, communityId: number): Promise<void>;
    sendMessage(client: Socket, data: {
        communityId: number;
        customerId: number;
        message: string;
    }): Promise<void>;
}
