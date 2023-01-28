# Simple drag and drop React hook and draggable component

> This is a simple react hook to create a draggable component.

![dragNDrop example ](https://user-images.githubusercontent.com/32627274/215250237-d04d21bd-e6bd-4761-a609-866b9307acd7.gif)

Please let me know anything if you need. I will try to work on this
Thank you for downloading!!

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

```jsx
import React from "react";
import { useDragNDrop } from "@tradelunch/usedragndrop";

function App() {
    // take event functions, positions, ref and etc.
    const { onMouseDown, onDragStart, onMouseUp, style, dragRef } =
        useDragNDrop({
            position: "absolute",
        });

    return (
        <div
            style={{
                // willChange: "transform, top, left",
                background: "#b6b6e5",
                height: "100vh",
                width: "100%",
            }}
        >
            {/* apply them into a dom to make it draggable */}
            <div
                style={style}
                ref={dragRef}
                // draggable
                onDragStart={onDragStart}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
            >
                <div
                    style={{
                        width: "100px",
                        height: "100px",
                        backgroundColor: "grey",
                        display: "flex",
                        flex: "1",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "0px",
                        padding: "0px",
                        fontWeight: "bold",
                        border: "2px solid darkgrey",
                    }}
                >
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
