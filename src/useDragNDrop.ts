import {
    useState,
    useRef,
    useCallback,
    useEffect,
    useMemo,
    CSSProperties,
} from "react";

type TPositions = "absolute" | "relative" | "fixed";

type TProps = {
    position?: TPositions;
};

export function useDragNDrop(props: TProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState<TPositions>(
        props.position ?? "absolute"
    );
    const [top, setTop] = useState(50);
    const [left, setLeft] = useState(50);

    const [shiftX, setShiftX] = useState(0);
    const [shiftY, setShiftY] = useState(0);
    const dragRef = useRef<HTMLDivElement>(null);

    // not working without a draggable property on an element
    const onDragStart = useCallback(() => {
        return false;
    }, []);

    const onMouseUp = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);
        // setPosition('absolute');
    }, [isDragging]);

    const onMouseDown = useCallback((e: any) => {
        const { currentTarget: dragElement, clientX, clientY } = e;
        if (!dragElement) return;
        e.preventDefault();

        setIsDragging(true);

        setShiftX(clientX - dragElement.getBoundingClientRect().left);
        setShiftY(clientY - dragElement.getBoundingClientRect().top);

        setPosition(props.position ?? "absolute");
    }, []);

    const onMouseMove = useCallback(
        (e: any) => {
            if (!dragRef.current) return;

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
                newY = Math.min(
                    newY,
                    document.documentElement.clientHeight -
                        dragElement.offsetHeight
                );
            }
            if (newY < 0) {
                newY = Math.max(newY, 0); // newY may not be below 0
            }

            // limit left
            if (newX < 0) newX = 0;
            if (
                newX >
                document.documentElement.clientWidth - dragElement.offsetWidth
            ) {
                newX =
                    document.documentElement.clientWidth -
                    dragElement.offsetWidth;
            }

            setLeft(newX);
            setTop(newY);
        },
        [shiftX, shiftY]
    );

    useEffect(() => {
        isDragging && document.addEventListener("mousemove", onMouseMove);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
        };
    }, [isDragging, onMouseMove]);

    const style: CSSProperties = useMemo(
        () => ({
            position: position,
            top: `${top}px`,
            left: `${left}px`,
            cursor: "pointer",
        }),
        [left, position, top]
    );

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
