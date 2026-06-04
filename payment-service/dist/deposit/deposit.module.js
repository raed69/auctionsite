"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const deposit_controller_1 = require("./deposit.controller");
const deposit_service_1 = require("./deposit.service");
const auth_module_1 = require("../auth/auth.module");
let DepositModule = class DepositModule {
};
exports.DepositModule = DepositModule;
exports.DepositModule = DepositModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, auth_module_1.AuthModule],
        controllers: [deposit_controller_1.DepositController],
        providers: [deposit_service_1.DepositService],
    })
], DepositModule);
//# sourceMappingURL=deposit.module.js.map