import React, {
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
    bounds?: React.RefObject<any>;
};

export function useDragNDrop(
    props: TProps = {
        position: "absolute",
    }
) {
    const { position: initialPosition = "absolute", bounds } = props;
    const $bounds = bounds?.current ?? document.documentElement;

    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState<TPositions>(initialPosition);
    const [top, setTop] = useState(0);
    const [left, setLeft] = useState(0);

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

        // setPosition(props.position ?? "absolute");
    }, []);

    const onMouseMove = useCallback(
        (e: any) => {
            if (!dragRef.current) return;

            // console.log('onMouseMove: ', e.clientX, e.clientY);
            const dragElement = dragRef.current;
            const { clientX, clientY } = e;

            // new window-relative coordinates
            let newX = clientX - shiftX - $bounds.getBoundingClientRect().left;
            let newY = clientY - shiftY - $bounds.getBoundingClientRect().top;

            // console.log(":: new:: ", {
            //     clientY,
            //     shiftY,
            //     newY,
            //     clientX,
            //     shiftX,
            //     newX,
            //     $bounds,
            //     dragRef: dragRef.current,
            // });

            // check if the new coordinates are below the bottom window edge
            let newBottom = newY + dragElement.offsetHeight;

            // limit bottom
            if (newBottom > $bounds.getBoundingClientRect().height) {
                newY = Math.min(
                    newY,
                    $bounds.getBoundingClientRect().height -
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
                $bounds.getBoundingClientRect().width - dragElement.offsetWidth
            ) {
                newX =
                    $bounds.getBoundingClientRect().width -
                    dragElement.offsetWidth;
            }

            setLeft(newX);
            setTop(newY);
        },
        [shiftX, shiftY]
    );

    useEffect(() => {
        isDragging && $bounds.addEventListener("mousemove", onMouseMove);
        return () => {
            $bounds.removeEventListener("mousemove", onMouseMove);
        };
    }, [isDragging, onMouseMove]);

    const style: CSSProperties = useMemo(
        () => ({
            position: position,
            top: `${top}px`,
            left: `${left}px`,
            cursor: "pointer",
            transform: `translate3d(0, 0, 0)`, // hardware acceleration
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
