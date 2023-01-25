import React from "react";
import { useDragNDrop } from ".";

interface Props {
    children: React.ReactNode;
}

export function Draggable({ children }: Props) {
    const { onMouseDown, onDragStart, onMouseUp, style, dragRef } =
        useDragNDrop();

    return (
        <div
            style={style}
            ref={dragRef}
            // draggable
            onDragStart={onDragStart}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
        >
            1111 -- {children}
        </div>
    );
}
