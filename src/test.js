"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = require("ava");
require("@k2oss/k2-broker-core/test-framework");
require("./index");
function mock(name, value) {
    global[name] = value;
}
(0, ava_1.default)("describe returns the hardcoded instance", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var schema;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                schema = null;
                mock("postSchema", function (result) {
                    schema = result;
                });
                return [4 /*yield*/, Promise.resolve(ondescribe({
                        configuration: {},
                    }))];
            case 1:
                _a.sent();
                t.deepEqual(schema, {
                    objects: {
                        todo: {
                            displayName: "TODO",
                            description: "Manages a TODO list",
                            properties: {
                                id: {
                                    displayName: "ID",
                                    type: "number",
                                },
                                userId: {
                                    displayName: "User ID",
                                    type: "number",
                                },
                                title: {
                                    displayName: "Title",
                                    type: "string",
                                },
                                completed: {
                                    displayName: "Completed",
                                    type: "boolean",
                                },
                            },
                            methods: {
                                get: {
                                    displayName: "Get TODO",
                                    type: "read",
                                    inputs: ["id"],
                                    outputs: ["id", "userId", "title", "completed"],
                                },
                                getParams: {
                                    displayName: "Get TODO",
                                    type: "read",
                                    parameters: {
                                        pid: {
                                            displayName: "param1",
                                            description: "Description Of Param 1",
                                            type: "number",
                                        },
                                    },
                                    requiredParameters: ["pid"],
                                    outputs: ["id"],
                                },
                            },
                        },
                    },
                });
                t.pass();
                return [2 /*return*/];
        }
    });
}); });
(0, ava_1.default)("execute fails with the wrong parameters", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, t.throwsAsync(Promise.resolve(onexecute({
                    objectName: "test1",
                    methodName: "unused",
                    parameters: {},
                    properties: {},
                    configuration: {},
                    schema: {},
                })))];
            case 1:
                error = _a.sent();
                t.deepEqual(error.message, "The object test1 is not supported.");
                return [4 /*yield*/, t.throwsAsync(Promise.resolve(onexecute({
                        objectName: "todo",
                        methodName: "test2",
                        parameters: {},
                        properties: {},
                        configuration: {},
                        schema: {},
                    })))];
            case 2:
                error = _a.sent();
                t.deepEqual(error.message, "The method test2 is not supported.");
                t.pass();
                return [2 /*return*/];
        }
    });
}); });
(0, ava_1.default)("execute passes with method params", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    function pr(r) {
        result = r;
    }
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                result = null;
                mock("postResult", pr);
                return [4 /*yield*/, Promise.resolve(onexecute({
                        objectName: "todo",
                        methodName: "getParams",
                        parameters: {
                            pid: 456,
                        },
                        properties: {},
                        configuration: {},
                        schema: {},
                    }))];
            case 1:
                _a.sent();
                t.deepEqual(result, {
                    id: 456,
                });
                t.pass();
                return [2 /*return*/];
        }
    });
}); });
(0, ava_1.default)("execute passes", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    function pr(r) {
        result = r;
    }
    var xhr, XHR, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                xhr = null;
                XHR = /** @class */ (function () {
                    function XHR() {
                        xhr = this.recorder = {};
                        this.recorder.headers = {};
                    }
                    XHR.prototype.open = function (method, url) {
                        this.recorder.opened = { method: method, url: url };
                    };
                    XHR.prototype.setRequestHeader = function (key, value) {
                        this.recorder.headers[key] = value;
                    };
                    XHR.prototype.send = function () {
                        var _this = this;
                        queueMicrotask(function () {
                            _this.readyState = 4;
                            _this.status = 200;
                            _this.responseText = JSON.stringify({
                                id: 123,
                                userId: 51,
                                title: "Groceries",
                                completed: false,
                            });
                            _this.onreadystatechange();
                            delete _this.responseText;
                        });
                    };
                    return XHR;
                }());
                mock("XMLHttpRequest", XHR);
                result = null;
                mock("postResult", pr);
                return [4 /*yield*/, Promise.resolve(onexecute({
                        objectName: "todo",
                        methodName: "get",
                        parameters: {},
                        properties: {
                            id: 123,
                        },
                        configuration: {},
                        schema: {},
                    }))];
            case 1:
                _a.sent();
                t.deepEqual(xhr, {
                    opened: {
                        method: "GET",
                        url: "https://jsonplaceholder.typicode.com/todos/123",
                    },
                    headers: {
                        test: "test value",
                    },
                });
                t.deepEqual(result, {
                    id: 123,
                    userId: 51,
                    title: "Groceries",
                    completed: false,
                });
                t.pass();
                return [2 /*return*/];
        }
    });
}); });
