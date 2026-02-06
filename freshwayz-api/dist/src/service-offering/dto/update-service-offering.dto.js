"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateServiceOfferingDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_service_offering_dto_1 = require("./create-service-offering.dto");
class UpdateServiceOfferingDto extends (0, mapped_types_1.PartialType)(create_service_offering_dto_1.CreateServiceOfferingDto) {
}
exports.UpdateServiceOfferingDto = UpdateServiceOfferingDto;
//# sourceMappingURL=update-service-offering.dto.js.map