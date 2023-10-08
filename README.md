# Simple drag and drop React hook and draggable component

> This is a simple react hook to create a draggable component.

<p align="center">
  <img src="https://user-images.githubusercontent.com/32627274/215250237-d04d21bd-e6bd-4761-a609-866b9307acd7.gif" alt="useDragNDrop example"/>
</p>

Please let me know anything if you need. I will try to work on this
Thank you for downloading!!

## added rxjs version drag and drop with an argument, wrapperScroll
```js
import { useDragNDropWithRxJs } from '@tradelunch/dragndrop';


const { ref, bounds, pos } = useDragNDropWithRxJs('scroll');

```
when you use 

overflow: scroll, 
height: 100vh

give 'scroll' as an argument




## Example

### use cra to create test app

```bash
npx create-react-app test-hook-example --template typescript
```

### install hook and use vscode

```bash
# move to example folder
cd test-hook-example

npm i @tradelunch/usedragndrop

# open folder with vscode
code .
```

### App.tsx

This code is simple file that I created for example. you can see how to use **useDragNDrop** hook briefly.

App.module.css
```css
.Box {
    background: #b6b6e5;
    height: 100vh;
    width: 100%;
}

.wrapper:hover {
    will-change: transform, top, left;
}

.Content {
    width: 100px;
    height: 100px;
    background-color: grey;
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    margin: 0px;
    padding: 0px;
    font-weight: bold;
    border: 2px solid darkgrey;
}


```

App.jsx
```jsx
import React, { useRef } from "react";
import { useDragNDrop } from "@tradelunch/usedragndrop";
import styles from "App.module.css";

function App() {
    // take event functions, positions, ref and etc.
    const bounds = useRef(null); // you can set bounds inside which a draggable component can move 
    const { onMouseDown, onDragStart, onMouseUp, style, dragRef } =
        useDragNDrop({
            position: "absolute",
            bounds
        });

    return (
        <div
            style={styles.Box}
            bounds={bounds}
        >
            {/* apply them into a dom to make it draggable */}
            <div
                style={styles.Wrapper}
                ref={dragRef}
                // draggable
                onDragStart={onDragStart}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
            >
                <div style={styles.Content} >
                    <span>Hello Drag!!</span>
                </div>
            </div>
        </div>
    );
}

export default App;
```

### You can use style or top/left value to adjust position what you want

```typescript
export declare function useDragNDrop(props?: TProps): {
    onMouseDown: (e: any) => void;
    onDragStart: () => false;
    onMouseUp: () => void;
    style: CSSProperties;
    dragRef: import("react").RefObject<HTMLDivElement>;
    top: number;
    left: number;
    isDragging: boolean;
    setIsDragging: import("react").Dispatch<
        import("react").SetStateAction<boolean>
    >;
    position: TPositions;
    shiftX: number;
    shiftY: number;
};
```
