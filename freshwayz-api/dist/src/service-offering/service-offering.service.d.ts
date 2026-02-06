import { Repository } from 'typeorm';
import { ServiceOffering } from './entities/service-offering.entity';
import { CreateServiceOfferingDto } from './dto/create-service-offering.dto';
import { UpdateServiceOfferingDto } from './dto/update-service-offering.dto';
export declare class ServiceOfferingService {
    private readonly serviceOfferingRepo;
    constructor(serviceOfferingRepo: Repository<ServiceOffering>);
    create(dto: CreateServiceOfferingDto): Promise<ServiceOffering>;
    findAll(): Promise<ServiceOffering[]>;
    findOne(serviceCode: string): Promise<ServiceOffering>;
    update(serviceCode: string, dto: UpdateServiceOfferingDto): Promise<ServiceOffering>;
    remove(serviceCode: string): Promise<ServiceOffering>;
}
