import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCommunityMessageDto } from './dto/create-community-message.dto';
import { UpdateCommunityMessageDto } from './dto/update-community-message.dto';
import { CommunityMessage } from './entities/community-message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from 'src/community/entities/community.entity';

@Injectable()
export class CommunityMessageService {
  constructor(
    @InjectRepository(CommunityMessage)
    private readonly messageRepo: Repository<CommunityMessage>,
  ) {}

  // Join a community: inserts into many-to-many table
  async joinCommunity(communityId: number, customerId: number) {
    await this.messageRepo.manager
      .createQueryBuilder()
      .relation(Community, 'customers')
      .of(communityId)
      .add(customerId);

    return {
      status: true,
      message: 'Community joined successfully',
      communityId,
      customerId,
    };
  }

  // send message
  async sendMessage(customerId: number, communityId: number, message: string) {

    // validate membership
    const exists = await this.messageRepo.manager.query(
      `SELECT 1 FROM community_customers_customer 
      WHERE customerId = ? AND communityId = ? LIMIT 1`,
      [customerId, communityId],
    );

    if (!exists.length) {
      throw new ForbiddenException('User must join community first');
    }

    const msg = this.messageRepo.create({
      message,
      community: { id: communityId },
      sender: { id: customerId },
    });

    const saved = await this.messageRepo.save(msg);

    return await this.getSingleMessage(saved.id);
  }

  // return single message with sender name
  async getSingleMessage(messageId: number) {
    return this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['sender'],
      select: {
        id: true,
        message: true,
        createdAt: true,
        sender: {
          id: true,
          fullName: true,
        },
      },
    });
  }

  // get full chat history
  async getMessages(communityId: number) {
    return await this.messageRepo.find({
      where: { community: { id: communityId } },
      relations: ['sender'],
      select: {
        id: true,
        message: true,
        createdAt: true,
        sender: {
          id: true,
          fullName: true,
        },
      },
      order: { createdAt: 'ASC' },
    });
  }

  // unused default CRUD (you can remove if not needed)
  create(dto: CreateCommunityMessageDto) {
    return 'disabled';
  }
  findAll() {
    return 'disabled';
  }
  findOne(id: number) {
    return 'disabled';
  }
  update(id: number, dto: UpdateCommunityMessageDto) {
    return 'disabled';
  }
  remove(id: number) {
    return 'disabled';
  }
}


// import { Injectable } from '@nestjs/common';
// import { CreateCommunityMessageDto } from './dto/create-community-message.dto';
// import { UpdateCommunityMessageDto } from './dto/update-community-message.dto';
// import { CommunityMessage } from './entities/community-message.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// @Injectable()
// export class CommunityMessageService {
//   constructor(
//     @InjectRepository(CommunityMessage)
//     private readonly messageRepo: Repository<CommunityMessage>
//   ) { }

//   async sendMessage(customerId: number, communityId: number, message: string) {
//     const msg = this.messageRepo.create({
//       message,
//       community: { id: communityId },
//       sender: { id: customerId }
//     });

//     return await this.messageRepo.save(msg);
//   }

//   async getMessages(communityId: number) {
//     return await this.messageRepo.find({
//       where: { community: { id: communityId } },
//       relations: ["sender"],
//       order: { createdAt: "ASC" }
//     });
//   }

//   create(createCommunityMessageDto: CreateCommunityMessageDto) {
//     return 'This action adds a new communityMessage';
//   }

//   findAll() {
//     return `This action returns all communityMessage`;
//   }

//   findOne(id: number) {
//     return `This action returns a #${id} communityMessage`;
//   }

//   update(id: number, updateCommunityMessageDto: UpdateCommunityMessageDto) {
//     return `This action updates a #${id} communityMessage`;
//   }

//   remove(id: number) {
//     return `This action removes a #${id} communityMessage`;
//   }
// }
