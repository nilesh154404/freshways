"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingContentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const marketing_content_service_1 = require("./marketing-content.service");
const marketing_content_controller_1 = require("./marketing-content.controller");
const marketing_content_entity_1 = require("./entities/marketing-content.entity");
const file_upload_module_1 = require("../file-upload/file-upload.module");
const interactions_entity_1 = require("./interactions/interactions.entity");
let MarketingContentModule = class MarketingContentModule {
};
exports.MarketingContentModule = MarketingContentModule;
exports.MarketingContentModule = MarketingContentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                marketing_content_entity_1.MarketingContent,
                interactions_entity_1.MarketingLike,
                interactions_entity_1.MarketingSave,
                interactions_entity_1.MarketingShare,
                interactions_entity_1.MarketingComment
            ]),
            file_upload_module_1.FileUploadModule,
        ],
        controllers: [marketing_content_controller_1.MarketingContentController],
        providers: [marketing_content_service_1.MarketingContentService],
    })
], MarketingContentModule);
//# sourceMappingURL=marketing-content.module.js.map