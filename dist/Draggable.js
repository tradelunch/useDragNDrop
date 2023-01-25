"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Draggable = void 0;
const react_1 = __importDefault(require("react"));
const _1 = require(".");
function Draggable({ children }) {
    const { onMouseDown, onDragStart, onMouseUp, style, dragRef } = (0, _1.useDragNDrop)();
    return react_1.default.createElement("div", null, children);
}
exports.Draggable = Draggable;
//# sourceMappingURL=Draggable.js.map