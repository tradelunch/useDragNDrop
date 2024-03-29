import {
    useObservable,
    useObservableRef,
    useObservableState,
} from "observable-hooks";
import { useEffect } from "react";
import {
    distinctUntilChanged,
    filter,
    first,
    fromEvent,
    map,
    merge,
    pluck,
    share,
    shareReplay,
    startWith,
    switchMap,
    takeUntil,
    withLatestFrom,
} from "rxjs";

import * as R from "ramda";
import { isValueExist } from "./util";

type TPosition = {
    x: number;
    y: number;
};

const SUPPORT_TOUCH =
    typeof window === "undefined" ? false : "ontouchstart" in window;

const EVENTS = {
    start: SUPPORT_TOUCH ? "touchstart" : "mousedown",
    move: SUPPORT_TOUCH ? "touchmove" : "mousemove",
    end: SUPPORT_TOUCH ? "touchend" : "mouseup",
};

function toPos(obs$: any) {
    return obs$.pipe(
        map((v: any) => {
            if (SUPPORT_TOUCH) {
                return {
                    x: v.changedTouches[0].pageX,
                    y: v.changedTouches[0].pageY,
                    clientX: v.changedTouches[0].clientX ?? 0,
                    clientY: v.changedTouches[0].clientY ?? 0,
                };
            }

            const pos = {
                x: v.pageX,
                y: v.pageY,
                clientX: v.clientX,
                clientY: v.clientY,
            };

            return pos;
        })
    );
}

type Props = {
    overflow?: string;
    bounds?: string | HTMLElement;
};

export const useDragNDropWithRxJs = (props: Props = {}) => {
    const { overflow = "scroll", bounds } = props;

    const [ref, ref$] = useObservableRef<any>();

    const bounds$ = useObservable(
        (arr$) => {
            return arr$.pipe(
                pluck(0),
                startWith(document.documentElement),
                filter<any>(isValueExist),
                map((v) => {
                    if (typeof v === "string") {
                        return document.querySelector(v);
                    }

                    return v;
                })
            );
        },
        [bounds]
    );

    useEffect(() => {
        if (!ref.current) return;

        const callback = (e: any) => {
            e.preventDefault();
        };
        document.addEventListener("dragstart", callback);

        return () => document.removeEventListener("dragstart", callback);
    }, [ref]);

    const item$ = useObservable(() => {
        return ref$.pipe(
            filter(R.identity),
            distinctUntilChanged<any>(R.equals),
            // tap((ref) => console.log('ref:: ', ref)),
            shareReplay(1)
        );
    });

    const down$ = useObservable(() => {
        return item$.pipe(
            switchMap(($item) => fromEvent($item, EVENTS.start).pipe(share()))
        );
    });
    const start$ = useObservable(() => down$.pipe(toPos));

    const move$ = useObservable(() => {
        return fromEvent(document, EVENTS.move).pipe(toPos);
    });

    const end$ = useObservable(() => {
        return item$.pipe(
            switchMap(($item) => fromEvent(document, EVENTS.end).pipe(toPos))
        );
    });

    const drag$ = useObservable(() => {
        return start$.pipe(
            switchMap((start) => {
                return move$.pipe(takeUntil(end$));
            }),
            share<any>()
        );
    });

    const drop$ = useObservable(() => {
        return drag$.pipe(
            switchMap((drag) => {
                return end$.pipe(
                    map((event) => drag),
                    first<any, TPosition>()
                );
            })
        );
    });

    const shift$ = useObservable(() => {
        return down$.pipe(
            map((event: any) => {
                const targetRect = event.target.getBoundingClientRect();
                const shift = {
                    shiftX: event.clientX - targetRect.left,
                    shiftY: event.clientY - targetRect.top,
                };
                // console.log('shift:: ', {
                //   shift,
                //   targetRect,
                //   clientX: event.clientX,
                //   clientY: event.clientY,
                // });
                return shift;
            }),
            share()
        );
    });

    const merged$ = useObservable(() => {
        const merged$ = merge(drag$, drop$).pipe(
            withLatestFrom(
                item$,
                bounds$,
                shift$,
                (pos, item, bounds, shift) => {
                    // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
                    // const { offsetWidth, offsetHeight } = item;

                    const { shiftX, shiftY } = shift;
                    const { x, y } = pos;

                    const boundRect = bounds.getBoundingClientRect();

                    const newY = (function (boundRect, item, bounds) {
                        const top = (function getTop(
                            overflow,
                            boundRect,
                            bounds
                        ) {
                            if (overflow === "scroll") return boundRect.top;
                            return Math.max(bounds.offsetTop, boundRect.top);
                        })(overflow, boundRect, bounds);

                        // top
                        let newY = y - shiftY - top + bounds.scrollTop;
                        newY = Math.min(
                            newY,
                            bounds.scrollHeight -
                                item.getBoundingClientRect().height
                        );

                        // top
                        newY = Math.max(newY, 0);

                        return newY;
                    })(boundRect, item, bounds);

                    const newX = (function (boundRect, item, bounds) {
                        let newX = x - shiftX - boundRect.left;

                        // left
                        newX = Math.max(newX, 0);

                        // right
                        newX = Math.min(
                            newX,
                            bounds.clientWidth -
                                item.getBoundingClientRect().width
                        );
                        // }

                        return newX;
                    })(boundRect, item, bounds);

                    return {
                        x: newX,
                        y: newY,
                    };
                }
            ),
            // tap((next) => console.log('next:: ', next)),
            distinctUntilChanged<TPosition>(R.equals)
        );

        return merged$;
    });

    const pos = useObservableState(merged$);

    // useSubscription(merged$, (pos) => {
    //     // console.log('merged:: ', pos);
    // });

    return {
        draggableRef: ref,
        ref,
        ref$,
        pos,
        bounds$,
        dragPos$: merged$,
    };
};
