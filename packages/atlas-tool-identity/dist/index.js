"use strict";
// index.ts
// ATLAS Identity Tool
// SMART on FHIR OAuth2 token management for healthcare AI agents
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.TokenExpiredError = exports.InvalidGrantError = exports.ProviderNotFoundError = exports.TokenNotFoundError = exports.IdentityBridgeError = exports.createIdentityBridge = exports.InMemoryTokenStore = exports.IdentityBridge = exports.GRANT_TYPES = exports.TOKEN_STATUS = exports.SMART_SCOPES = exports.UserInfoSchema = exports.RevocationRequestSchema = exports.IntrospectionResponseSchema = exports.IntrospectionRequestSchema = exports.TokenRefreshResultSchema = exports.TokenValidationSchema = exports.AuthorizationRequestSchema = exports.TokenRequestSchema = exports.SmartConfigSchema = exports.StoredTokenSchema = exports.OAuthTokenSchema = void 0;
// ==================== Re-export types from types.ts ====================
var types_1 = require("./types");
Object.defineProperty(exports, "OAuthTokenSchema", { enumerable: true, get: function () { return types_1.OAuthTokenSchema; } });
Object.defineProperty(exports, "StoredTokenSchema", { enumerable: true, get: function () { return types_1.StoredTokenSchema; } });
Object.defineProperty(exports, "SmartConfigSchema", { enumerable: true, get: function () { return types_1.SmartConfigSchema; } });
Object.defineProperty(exports, "TokenRequestSchema", { enumerable: true, get: function () { return types_1.TokenRequestSchema; } });
Object.defineProperty(exports, "AuthorizationRequestSchema", { enumerable: true, get: function () { return types_1.AuthorizationRequestSchema; } });
Object.defineProperty(exports, "TokenValidationSchema", { enumerable: true, get: function () { return types_1.TokenValidationSchema; } });
Object.defineProperty(exports, "TokenRefreshResultSchema", { enumerable: true, get: function () { return types_1.TokenRefreshResultSchema; } });
Object.defineProperty(exports, "IntrospectionRequestSchema", { enumerable: true, get: function () { return types_1.IntrospectionRequestSchema; } });
Object.defineProperty(exports, "IntrospectionResponseSchema", { enumerable: true, get: function () { return types_1.IntrospectionResponseSchema; } });
Object.defineProperty(exports, "RevocationRequestSchema", { enumerable: true, get: function () { return types_1.RevocationRequestSchema; } });
Object.defineProperty(exports, "UserInfoSchema", { enumerable: true, get: function () { return types_1.UserInfoSchema; } });
Object.defineProperty(exports, "SMART_SCOPES", { enumerable: true, get: function () { return types_1.SMART_SCOPES; } });
Object.defineProperty(exports, "TOKEN_STATUS", { enumerable: true, get: function () { return types_1.TOKEN_STATUS; } });
Object.defineProperty(exports, "GRANT_TYPES", { enumerable: true, get: function () { return types_1.GRANT_TYPES; } });
// ==================== Re-export main classes and utilities ====================
var identity_bridge_1 = require("./identity-bridge");
Object.defineProperty(exports, "IdentityBridge", { enumerable: true, get: function () { return identity_bridge_1.IdentityBridge; } });
Object.defineProperty(exports, "InMemoryTokenStore", { enumerable: true, get: function () { return identity_bridge_1.InMemoryTokenStore; } });
Object.defineProperty(exports, "createIdentityBridge", { enumerable: true, get: function () { return identity_bridge_1.createIdentityBridge; } });
// ==================== Export custom errors ====================
var identity_bridge_2 = require("./identity-bridge");
Object.defineProperty(exports, "IdentityBridgeError", { enumerable: true, get: function () { return identity_bridge_2.IdentityBridgeError; } });
Object.defineProperty(exports, "TokenNotFoundError", { enumerable: true, get: function () { return identity_bridge_2.TokenNotFoundError; } });
Object.defineProperty(exports, "ProviderNotFoundError", { enumerable: true, get: function () { return identity_bridge_2.ProviderNotFoundError; } });
Object.defineProperty(exports, "InvalidGrantError", { enumerable: true, get: function () { return identity_bridge_2.InvalidGrantError; } });
Object.defineProperty(exports, "TokenExpiredError", { enumerable: true, get: function () { return identity_bridge_2.TokenExpiredError; } });
// ==================== Default export ====================
var identity_bridge_3 = require("./identity-bridge");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return identity_bridge_3.IdentityBridge; } });
//# sourceMappingURL=index.js.map