import {
    useObservable,
    useObservableRef,
    useObservableState,
    useSubscription,
} from 'observable-hooks';
import { useEffect, useMemo, useState } from 'react';
import {
    Subject,
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
    tap,
    withLatestFrom,
} from 'rxjs';

import * as R from 'ramda';

export const useDragNDropWithRxJs = () => {
    const [ref, ref$] = useObservableRef<any>();
    const [bounds, bounds$] = useObservableRef<any>(document);

    useEffect(() => {
        if (!ref.current) return;

        const callback = (e: any) => {
            e.preventDefault();
        };
        document.addEventListener('dragstart', callback);

        return () => document.removeEventListener('dragstart', callback);
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
                const currentTargetRect =
                    event.currentTarget.getBoundingClientRect();
                const shift = {
                    shiftX: event.clientX - currentTargetRect.left,
                    shiftY: event.clientY - currentTargetRect.top,
                };
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
                        // const top = boundRect.top;
                        const top = Math.max(bounds.offsetTop, boundRect.top);
                        let newY = y - shiftY - top;

                        // bottom
                        // const newBottom = newY + item.offsetHeight;
                        // if (newBottom > boundRect.height) {
                        newY = Math.min(
                            newY,
                            bounds.clientHeight -
                                item.getBoundingClientRect().height
                        );
                        // }

                        // top
                        newY = Math.max(newY, 0);

                        return newY;
                    })(boundRect, item, bounds);

                    const newX = (function (boundRect, item, bounds) {
                        let newX = x - shiftX - boundRect.left;

                        // left
                        newX = Math.max(newX, 0);

                        // right
                        // if (newX > boundRect.width - item.offsetWidth) {
                        // newX = boundRect.width - item.offsetWidth;
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
        ref,
        ref$,
        pos,
        bounds,
        bounds$,
    };
};

type TPosition = {
    x: number;
    y: number;
};

const SUPPORT_TOUCH = 'ontouchstart' in window;

const EVENTS = {
    start: SUPPORT_TOUCH ? 'touchstart' : 'mousedown',
    move: SUPPORT_TOUCH ? 'touchmove' : 'mousemove',
    end: SUPPORT_TOUCH ? 'touchend' : 'mouseup',
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

            return {
                x: v.pageX,
                y: v.pageY,
                clientX: v.clientX,
                clientY: v.clientY,
            };
        })
    );
}
