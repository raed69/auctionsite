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
var UserBalanceClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBalanceClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let UserBalanceClient = UserBalanceClient_1 = class UserBalanceClient {
    config;
    logger = new common_1.Logger(UserBalanceClient_1.name);
    constructor(config) {
        this.config = config;
    }
    async credit(userId, amount, attempts = 3) {
        const url = this.config.get('USER_SERVICE_URL');
        const secret = this.config.get('INTERNAL_SECRET');
        if (!url) {
            throw new common_1.ServiceUnavailableException('USER_SERVICE_URL is not configured');
        }
        let lastError = 'unknown error';
        for (let attempt = 1; attempt <= attempts; attempt++) {
            try {
                const res = await fetch(`${url}/user/internal/balance/credit/${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-service-secret': secret ?? '',
                    },
                    body: JSON.stringify({ amount }),
                });
                if (res.ok)
                    return;
                lastError = `user-service responded ${res.status}`;
                if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                    throw new common_1.BadRequestException(`Failed to credit balance: ${lastError}`);
                }
            }
            catch (err) {
                if (err instanceof common_1.BadRequestException)
                    throw err;
                lastError = err.message;
            }
            if (attempt < attempts) {
                this.logger.warn(`Credit attempt ${attempt}/${attempts} for user ${userId} failed (${lastError}) — retrying`);
                await this.delay(200 * attempt);
            }
        }
        throw new common_1.ServiceUnavailableException(`Failed to credit balance after ${attempts} attempts: ${lastError}`);
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.UserBalanceClient = UserBalanceClient;
exports.UserBalanceClient = UserBalanceClient = UserBalanceClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UserBalanceClient);
//# sourceMappingURL=user-balance.client.js.map