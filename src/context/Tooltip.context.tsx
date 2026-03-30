// You can save this as e.g. Tooltip.context.ts or Tooltip.context.tsx

export const positionClasses: Record<string, string> = {
  top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
  bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
  left: "right-full mr-2 top-1/2 -translate-y-1/2",
  right: "left-full ml-2 top-1/2 -translate-y-1/2",
  "top-left": "bottom-full mb-2 right-0",
  "top-right": "bottom-full mb-2 left-0",
  "bottom-left": "top-full mt-2 right-0",
  "bottom-right": "top-full mt-2 left-0",
  "left-top": "right-full mr-2 bottom-0",
  "left-bottom": "right-full mr-2 top-0",
  "right-top": "left-full ml-2 bottom-0",
  "right-bottom": "left-full ml-2 top-0",
};

interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export const calculatePosition = (
  triggerRect: Rect,
  tooltipRect: Rect,
  position: string,
): string => {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  const spaceBelow = viewportHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  const spaceRight = viewportWidth - triggerRect.right;
  const spaceLeft = triggerRect.left;

  let newPosition = position;

  // Vertical flipping logic
  if (
    position === "top" ||
    position === "top-left" ||
    position === "top-right"
  ) {
    if (spaceAbove < 60 && spaceBelow > spaceAbove) {
      newPosition =
        position === "top"
          ? "bottom"
          : position === "top-left"
            ? "bottom-left"
            : "bottom-right";
    }
  } else if (
    position === "bottom" ||
    position === "bottom-left" ||
    position === "bottom-right"
  ) {
    if (spaceBelow < 60 && spaceAbove > spaceBelow) {
      newPosition =
        position === "bottom"
          ? "top"
          : position === "bottom-left"
            ? "top-left"
            : "top-right";
    }
  }

  // Horizontal flipping / alignment adjustment
  if (newPosition.includes("left")) {
    if (spaceLeft < tooltipRect.width && spaceRight > spaceLeft) {
      newPosition = newPosition.replace("left", "right");
    }
  } else if (newPosition.includes("right")) {
    if (spaceRight < tooltipRect.width && spaceLeft > spaceRight) {
      newPosition = newPosition.replace("right", "left");
    }
  } else {
    // Centered positions → decide to shift left or right aligned
    if (spaceRight < tooltipRect.width / 2 && spaceLeft > spaceRight) {
      newPosition = newPosition + "-left";
    } else if (spaceLeft < tooltipRect.width / 2 && spaceRight > spaceLeft) {
      newPosition = newPosition + "-right";
    }
  }

  return newPosition;
};
