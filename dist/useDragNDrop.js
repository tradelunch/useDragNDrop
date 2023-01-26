"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDragNDrop = void 0;
const react_1 = require("react");
function useDragNDrop(props = {
    position: "absolute",
}) {
    var _a;
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const [position, setPosition] = (0, react_1.useState)((_a = props.position) !== null && _a !== void 0 ? _a : "absolute");
    const [top, setTop] = (0, react_1.useState)(50);
    const [left, setLeft] = (0, react_1.useState)(50);
    const [shiftX, setShiftX] = (0, react_1.useState)(0);
    const [shiftY, setShiftY] = (0, react_1.useState)(0);
    const dragRef = (0, react_1.useRef)(null);
    // not working without a draggable property on an element
    const onDragStart = (0, react_1.useCallback)(() => {
        return false;
    }, []);
    const onMouseUp = (0, react_1.useCallback)(() => {
        if (!isDragging)
            return;
        setIsDragging(false);
        // setPosition('absolute');
    }, [isDragging]);
    const onMouseDown = (0, react_1.useCallback)((e) => {
        var _a;
        const { currentTarget: dragElement, clientX, clientY } = e;
        if (!dragElement)
            return;
        e.preventDefault();
        setIsDragging(true);
        setShiftX(clientX - dragElement.getBoundingClientRect().left);
        setShiftY(clientY - dragElement.getBoundingClientRect().top);
        setPosition((_a = props.position) !== null && _a !== void 0 ? _a : "absolute");
    }, []);
    const onMouseMove = (0, react_1.useCallback)((e) => {
        if (!dragRef.current)
            return;
        // console.log('onMouseMove: ', e.clientX, e.clientY);
        const dragElement = dragRef.current;
        const { clientX, clientY } = e;
        // new window-relative coordinates
        let newX = clientX - shiftX;
        let newY = clientY - shiftY;
        // check if the new coordinates are below the bottom window edge
        let newBottom = newY + dragElement.offsetHeight;
        // limit bottom
        if (newBottom > document.documentElement.clientHeight) {
            newY = Math.min(newY, document.documentElement.clientHeight -
                dragElement.offsetHeight);
        }
        if (newY < 0) {
            newY = Math.max(newY, 0); // newY may not be below 0
        }
        // limit left
        if (newX < 0)
            newX = 0;
        if (newX >
            document.documentElement.clientWidth - dragElement.offsetWidth) {
            newX =
                document.documentElement.clientWidth -
                    dragElement.offsetWidth;
        }
        setLeft(newX);
        setTop(newY);
    }, [shiftX, shiftY]);
    (0, react_1.useEffect)(() => {
        isDragging && document.addEventListener("mousemove", onMouseMove);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
        };
    }, [isDragging, onMouseMove]);
    const style = (0, react_1.useMemo)(() => ({
        position: position,
        top: `${top}px`,
        left: `${left}px`,
        cursor: "pointer",
    }), [left, position, top]);
    return {
        onMouseDown,
        onDragStart,
        onMouseUp,
        style,
        dragRef,
        top,
        left,
        isDragging,
        setIsDragging,
        position,
        shiftX,
        shiftY,
    };
}
exports.useDragNDrop = useDragNDrop;
