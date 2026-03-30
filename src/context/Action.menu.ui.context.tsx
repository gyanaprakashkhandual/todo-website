/* eslint-disable react-hooks/refs */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type RefObject,
} from "react";

export type MenuPosition =
  | "auto"
  | "bottom-start"
  | "bottom-end"
  | "bottom-center"
  | "top-start"
  | "top-end"
  | "top-center"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end";

export interface ComputedPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  transformOrigin: string;
  placement: MenuPosition;
}

export interface ActionMenuContextValue {
  open: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  position: MenuPosition;
  computedPosition: ComputedPosition | null;
  recalculate: () => void;
  menuId: string;
  nested: boolean;
}

const ActionMenuContext = createContext<ActionMenuContextValue | null>(null);

export function useActionMenu(): ActionMenuContextValue {
  const ctx = useContext(ActionMenuContext);
  if (!ctx) {
    throw new Error(
      "useActionMenu must be used within an <ActionMenu.Provider>",
    );
  }
  return ctx;
}

let idCounter = 0;
function generateId() {
  return `action-menu-${++idCounter}`;
}

const MENU_MARGIN = 8;

export function computePosition(
  anchor: DOMRect,
  overlay: DOMRect,
  preference: MenuPosition,
  viewport: { width: number; height: number },
): ComputedPosition {
  const positions: Record<
    Exclude<MenuPosition, "auto">,
    () => ComputedPosition
  > = {
    "bottom-start": () => ({
      top: anchor.bottom + MENU_MARGIN,
      left: anchor.left,
      transformOrigin: "top left",
      placement: "bottom-start",
    }),
    "bottom-end": () => ({
      top: anchor.bottom + MENU_MARGIN,
      left: anchor.right - overlay.width,
      transformOrigin: "top right",
      placement: "bottom-end",
    }),
    "bottom-center": () => ({
      top: anchor.bottom + MENU_MARGIN,
      left: anchor.left + anchor.width / 2 - overlay.width / 2,
      transformOrigin: "top center",
      placement: "bottom-center",
    }),
    "top-start": () => ({
      top: anchor.top - overlay.height - MENU_MARGIN,
      left: anchor.left,
      transformOrigin: "bottom left",
      placement: "top-start",
    }),
    "top-end": () => ({
      top: anchor.top - overlay.height - MENU_MARGIN,
      left: anchor.right - overlay.width,
      transformOrigin: "bottom right",
      placement: "top-end",
    }),
    "top-center": () => ({
      top: anchor.top - overlay.height - MENU_MARGIN,
      left: anchor.left + anchor.width / 2 - overlay.width / 2,
      transformOrigin: "bottom center",
      placement: "top-center",
    }),
    "left-start": () => ({
      top: anchor.top,
      left: anchor.left - overlay.width - MENU_MARGIN,
      transformOrigin: "right top",
      placement: "left-start",
    }),
    "left-end": () => ({
      top: anchor.bottom - overlay.height,
      left: anchor.left - overlay.width - MENU_MARGIN,
      transformOrigin: "right bottom",
      placement: "left-end",
    }),
    "right-start": () => ({
      top: anchor.top,
      left: anchor.right + MENU_MARGIN,
      transformOrigin: "left top",
      placement: "right-start",
    }),
    "right-end": () => ({
      top: anchor.bottom - overlay.height,
      left: anchor.right + MENU_MARGIN,
      transformOrigin: "left bottom",
      placement: "right-end",
    }),
  };

  const AUTO_PRIORITY: Exclude<MenuPosition, "auto">[] = [
    "bottom-start",
    "bottom-end",
    "top-start",
    "top-end",
    "right-start",
    "left-start",
  ];

  function fits(pos: ComputedPosition): boolean {
    const t = pos.top ?? 0;
    const l = pos.left ?? 0;
    return (
      t >= MENU_MARGIN &&
      l >= MENU_MARGIN &&
      t + overlay.height <= viewport.height - MENU_MARGIN &&
      l + overlay.width <= viewport.width - MENU_MARGIN
    );
  }

  function clamp(pos: ComputedPosition): ComputedPosition {
    const t = Math.max(
      MENU_MARGIN,
      Math.min(pos.top ?? 0, viewport.height - overlay.height - MENU_MARGIN),
    );
    const l = Math.max(
      MENU_MARGIN,
      Math.min(pos.left ?? 0, viewport.width - overlay.width - MENU_MARGIN),
    );
    return { ...pos, top: t, left: l };
  }

  if (preference !== "auto") {
    return clamp(positions[preference]());
  }

  for (const p of AUTO_PRIORITY) {
    const candidate = positions[p]();
    if (fits(candidate)) return candidate;
  }

  return clamp(positions["bottom-start"]());
}

export interface ActionMenuProviderProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: MenuPosition;
  nested?: boolean;
  closeOnClickOutside?: boolean;
}

export function ActionMenuProvider({
  children,
  open: controlledOpen,
  onOpenChange,
  position = "auto",
  nested = false,
  closeOnClickOutside = true,
}: ActionMenuProviderProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const anchorRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [computedPosition, setComputedPosition] =
    useState<ComputedPosition | null>(null);
  const menuId = useRef(generateId()).current;

  // Track whether pointer went down inside the overlay — if yes, don't close on click outside
  const pointerDownInsideRef = useRef(false);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const openMenu = useCallback(() => setOpen(true), [setOpen]);
  const closeMenu = useCallback(() => setOpen(false), [setOpen]);
  const toggleMenu = useCallback(() => setOpen(!open), [open, setOpen]);

  const recalculate = useCallback(() => {
    const anchor = anchorRef.current;
    const overlay = overlayRef.current;
    if (!anchor || !overlay) return;
    const anchorRect = anchor.getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const pos = computePosition(anchorRect, overlayRect, position, viewport);
    setComputedPosition(pos);
  }, [position]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => recalculate());
    } else {
      setComputedPosition(null);
    }
  }, [open, recalculate]);

  useEffect(() => {
    if (!open || !closeOnClickOutside) return;

    // Use pointerdown only to RECORD whether the press was inside overlay/anchor.
    // Never close on pointerdown — wait for the click to complete first.
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      const insideOverlay = overlayRef.current?.contains(target) ?? false;
      const insideAnchor = anchorRef.current?.contains(target) ?? false;
      pointerDownInsideRef.current = insideOverlay || insideAnchor;
    }

    // Close only on click (after mousedown+mouseup cycle completes),
    // and only if the original pointerdown was outside both overlay and anchor.
    function handleClick(e: MouseEvent) {
      if (pointerDownInsideRef.current) return;
      const target = e.target as Node;
      const insideOverlay = overlayRef.current?.contains(target) ?? false;
      const insideAnchor = anchorRef.current?.contains(target) ?? false;
      if (!insideOverlay && !insideAnchor) {
        closeMenu();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, [open, closeMenu, closeOnClickOutside]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeMenu();
        anchorRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open, closeMenu]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", recalculate);
    window.addEventListener("scroll", recalculate, true);
    return () => {
      window.removeEventListener("resize", recalculate);
      window.removeEventListener("scroll", recalculate, true);
    };
  }, [open, recalculate]);

  const value: ActionMenuContextValue = {
    open,
    openMenu,
    closeMenu,
    toggleMenu,
    anchorRef,
    overlayRef,
    position,
    computedPosition,
    recalculate,
    menuId,
    nested,
  };

  return (
    <ActionMenuContext.Provider value={value}>
      {children}
    </ActionMenuContext.Provider>
  );
}
