"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePriceConfigurationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_price_configuration_dto_1 = require("./create-price-configuration.dto");
class UpdatePriceConfigurationDto extends (0, mapped_types_1.PartialType)(create_price_configuration_dto_1.CreatePriceConfigurationDto) {
}
exports.UpdatePriceConfigurationDto = UpdatePriceConfigurationDto;
//# sourceMappingURL=update-price-configuration.dto.js.map