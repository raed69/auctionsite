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
exports.WithdrawController = void 0;
const common_1 = require("@nestjs/common");
const withdraw_service_1 = require("./withdraw.service");
const initiate_withdraw_dto_1 = require("./dto/initiate-withdraw.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let WithdrawController = class WithdrawController {
    withdrawService;
    constructor(withdrawService) {
        this.withdrawService = withdrawService;
    }
    async initiateWithdraw(dto, req) {
        return this.withdrawService.initiateWithdraw(dto, req.user.id);
    }
    async getStatus(ref) {
        return this.withdrawService.getWithdrawStatus(ref);
    }
    async getAllWithdrawals() {
        return this.withdrawService.getAllWithdrawals();
    }
    async completeWithdraw(ref) {
        return this.withdrawService.completeWithdraw(ref);
    }
};
exports.WithdrawController = WithdrawController;
__decorate([
    (0, common_1.Post)('initiate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [initiate_withdraw_dto_1.InitiateWithdrawDto, Object]),
    __metadata("design:returntype", Promise)
], WithdrawController.prototype, "initiateWithdraw", null);
__decorate([
    (0, common_1.Get)('status/:ref'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WithdrawController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WithdrawController.prototype, "getAllWithdrawals", null);
__decorate([
    (0, common_1.Patch)('admin/complete/:ref'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WithdrawController.prototype, "completeWithdraw", null);
exports.WithdrawController = WithdrawController = __decorate([
    (0, common_1.Controller)('payments/withdraw'),
    __metadata("design:paramtypes", [withdraw_service_1.WithdrawService])
], WithdrawController);
//# sourceMappingURL=withdraw.controller.js.map