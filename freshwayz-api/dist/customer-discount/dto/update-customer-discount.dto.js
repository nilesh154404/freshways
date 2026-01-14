"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCustomerDiscountDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_customer_discount_dto_1 = require("./create-customer-discount.dto");
class UpdateCustomerDiscountDto extends (0, swagger_1.PartialType)(create_customer_discount_dto_1.CreateCustomerDiscountDto) {
}
exports.UpdateCustomerDiscountDto = UpdateCustomerDiscountDto;
//# sourceMappingURL=update-customer-discount.dto.js.map