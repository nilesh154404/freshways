"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTypeController = void 0;
const common_1 = require("@nestjs/common");
const user_type_service_1 = require("./user-type.service");
const create_user_type_dto_1 = require("./dto/create-user-type.dto");
const update_user_type_dto_1 = require("./dto/update-user-type.dto");
let UserTypeController = class UserTypeController {
    userTypeService;
    constructor(userTypeService) {
        this.userTypeService = userTypeService;
    }
    create(createUserTypeDto) {
        return this.userTypeService.create(createUserTypeDto);
    }
    findAll() {
        return this.userTypeService.findAll();
    }
    findOne(id) {
        return this.userTypeService.findOne(+id);
    }
    update(id, updateUserTypeDto) {
        return this.userTypeService.update(+id, updateUserTypeDto);
    }
    remove(id) {
        return this.userTypeService.remove(+id);
    }
};
exports.UserTypeController = UserTypeController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_type_dto_1.CreateUserTypeDto]),
    __metadata("design:returntype", void 0)
], UserTypeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserTypeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserTypeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_type_dto_1.UpdateUserTypeDto]),
    __metadata("design:returntype", void 0)
], UserTypeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserTypeController.prototype, "remove", null);
exports.UserTypeController = UserTypeController = __decorate([
    (0, common_1.Controller)('user-type'),
    __metadata("design:paramtypes", [user_type_service_1.UserTypeService])
], UserTypeController);
//# sourceMappingURL=user-type.controller.js.map