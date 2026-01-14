"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVendorProductDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_vendor_product_dto_1 = require("./create-vendor-product.dto");
class UpdateVendorProductDto extends (0, swagger_1.PartialType)(create_vendor_product_dto_1.CreateVendorProductDto) {
}
exports.UpdateVendorProductDto = UpdateVendorProductDto;
//# sourceMappingURL=update-vendor-product.dto.js.map