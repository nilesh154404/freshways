import { ServiceOfferingService } from './service-offering.service';
import { CreateServiceOfferingDto } from './dto/create-service-offering.dto';
import { UpdateServiceOfferingDto } from './dto/update-service-offering.dto';
export declare class ServiceOfferingController {
    private readonly serviceOfferingService;
    constructor(serviceOfferingService: ServiceOfferingService);
    create(dto: CreateServiceOfferingDto): Promise<import("./entities/service-offering.entity").ServiceOffering>;
    findAll(): Promise<import("./entities/service-offering.entity").ServiceOffering[]>;
    findOne(serviceCode: string): Promise<import("./entities/service-offering.entity").ServiceOffering>;
    update(serviceCode: string, dto: UpdateServiceOfferingDto): Promise<import("./entities/service-offering.entity").ServiceOffering>;
    remove(serviceCode: string): Promise<import("./entities/service-offering.entity").ServiceOffering>;
}
