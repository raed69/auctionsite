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
exports.DepositController = void 0;
const common_1 = require("@nestjs/common");
const deposit_service_1 = require("./deposit.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let DepositController = class DepositController {
    depositService;
    constructor(depositService) {
        this.depositService = depositService;
    }
    initiate(req, body) {
        return this.depositService.initiateDeposit({
            buyerId: String(req.user.id),
            amount: body.amount,
        });
    }
    webhook(body) {
        return this.depositService.handleDepositWebhook(body);
    }
    mockPay(paymentRef) {
        return this.depositService.mockPay(paymentRef);
    }
    status(paymentRef) {
        return this.depositService.getDepositStatus(paymentRef);
    }
};
exports.DepositController = DepositController;
__decorate([
    (0, common_1.Post)('initiate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DepositController.prototype, "initiate", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DepositController.prototype, "webhook", null);
__decorate([
    (0, common_1.Get)('mock-pay/:paymentRef'),
    __param(0, (0, common_1.Param)('paymentRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DepositController.prototype, "mockPay", null);
__decorate([
    (0, common_1.Get)('status/:paymentRef'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('paymentRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DepositController.prototype, "status", null);
exports.DepositController = DepositController = __decorate([
    (0, common_1.Controller)('payments/deposit'),
    __metadata("design:paramtypes", [deposit_service_1.DepositService])
], DepositController);
//# sourceMappingURL=deposit.controller.js.map