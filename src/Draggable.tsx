import React from "react";
import { useDragNDrop } from ".";

interface Props {
    children: React.ReactNode;
}

export function Draggable({ children }: Props) {
    const { onMouseDown, onDragStart, onMouseUp, style, dragRef } =
        useDragNDrop();

    return <div>{children}</div>;
}
