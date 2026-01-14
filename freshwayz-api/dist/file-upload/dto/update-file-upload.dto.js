"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFileUploadDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_file_upload_dto_1 = require("./create-file-upload.dto");
class UpdateFileUploadDto extends (0, swagger_1.PartialType)(create_file_upload_dto_1.CreateFileUploadDto) {
}
exports.UpdateFileUploadDto = UpdateFileUploadDto;
//# sourceMappingURL=update-file-upload.dto.js.map