/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */

import React, {
  forwardRef,
  useRef,
  useCallback,
  useEffect,
  cloneElement,
  isValidElement,
  Children,
  useState,
  type ReactElement,
  type ReactNode,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Check,
  Search,
  X as XIcon,
} from "lucide-react";

import {
  ActionMenuProvider,
  useActionMenu,
  type MenuPosition,
  type ActionMenuProviderProps,
} from "../context/Action.menu.ui.context";

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ====================== TYPES ======================

export interface ActionMenuProps extends Omit<
  ActionMenuProviderProps,
  "nested"
> {
  nested?: boolean;
  closeOnClickOutside?: boolean;
}

export interface ActionMenuAnchorProps {
  children: ReactElement;
}

export interface ActionMenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leadingIcon?: ReactNode;
  showChevron?: boolean;
  variant?: "default" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export interface ActionMenuOverlayProps {
  children: ReactNode;
  minWidth?: number;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}

export interface ActionMenuListProps {
  children: ReactNode;
  className?: string;
  search?: boolean;
  searchPlaceholder?: string;
  select?: boolean;
  onSelectionChange?: (selectedItems: string[]) => void;
}

export interface ActionMenuItemProps {
  children: ReactNode;
  onSelect?: () => void;
  leadingIcon?: ReactNode;
  trailingVisual?: ReactNode;
  shortcut?: string;
  variant?: "default" | "danger";
  disabled?: boolean;
  selected?: boolean;
  selectionVariant?: "single" | "multiple";
  description?: string;
  className?: string;
  select?: boolean;
}

export interface ActionMenuSubmenuItemProps {
  children: ReactNode;
  leadingIcon?: ReactNode;
  description?: string;
  className?: string;
}

export interface ActionMenuGroupProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

export interface ActionMenuHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface ActionMenuFooterProps {
  children: ReactNode;
  className?: string;
}

export interface ActionMenuNestedProps extends Omit<
  ActionMenuProps,
  "nested" | "position"
> {
  position?: MenuPosition;
}

// ====================== COMPONENT ======================

function ActionMenuRoot({
  children,
  open,
  onOpenChange,
  position = "auto",
  nested = false,
  closeOnClickOutside = true,
}: ActionMenuProps) {
  return (
    <ActionMenuProvider
      open={open}
      onOpenChange={onOpenChange}
      position={position}
      nested={nested}
      closeOnClickOutside={closeOnClickOutside}
    >
      {children}
    </ActionMenuProvider>
  );
}

function ActionMenuAnchor({ children }: ActionMenuAnchorProps) {
  const { anchorRef, toggleMenu, open, menuId } = useActionMenu();

  const child = Children.only(children);

  if (!isValidElement(child)) {
    throw new Error(
      "ActionMenu.Anchor requires exactly one React element child.",
    );
  }

  return cloneElement(child as ReactElement<any>, {
    ref: anchorRef,
    onClick: (e: MouseEvent) => {
      (child as ReactElement<any>).props.onClick?.(e);
      toggleMenu();
    },
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
  });
}

const variantClasses: Record<
  "default" | "danger" | "ghost" | "outline",
  string
> = {
  default:
    "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 active:bg-neutral-100 dark:active:bg-neutral-700",
  danger:
    "bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50",
  ghost:
    "bg-transparent border border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800",
  outline:
    "bg-transparent border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800",
};

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5 rounded-md",
  md: "h-9 px-3.5 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 text-base gap-2.5 rounded-xl",
};

const ActionMenuButton = forwardRef<HTMLButtonElement, ActionMenuButtonProps>(
  function ActionMenuButton(
    {
      children,
      leadingIcon,
      showChevron = true,
      variant = "default",
      size = "md",
      className,
      disabled,
      ...rest
    },
    ref,
  ) {
    const { toggleMenu, open, menuId } = useActionMenu();
    const anchorRef = useRef<HTMLButtonElement>(null);
    return (
      <button
        ref={ref || anchorRef}
        type="button"
        role="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={disabled}
        onClick={toggleMenu}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {leadingIcon && <span>{leadingIcon}</span>}
        {children}
        {showChevron && (
          <ChevronDown className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    );
  },
);

const overlayVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.1, ease: easeInOut },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.14, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.1, ease: easeInOut },
  },
};

function ActionMenuOverlay({
  children,
  minWidth = 200,
  maxWidth = 320,
  maxHeight = 360,
  className,
}: ActionMenuOverlayProps) {
  const { open, overlayRef, computedPosition, menuId } = useActionMenu();

  const style: React.CSSProperties = computedPosition
    ? {
        position: "fixed",
        top: computedPosition.top,
        left: computedPosition.left,
        minWidth,
        maxWidth,
        maxHeight,
        transformOrigin: computedPosition.transformOrigin,
        zIndex: 9999,
      }
    : {
        position: "fixed",
        opacity: 0,
        pointerEvents: "none",
        minWidth,
        maxWidth,
        maxHeight,
        zIndex: 9999,
      };

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          id={menuId}
          role="menu"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          style={style}
          className={cn(
            "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}

function ActionMenuList({
  children,
  className,
  search = false,
  searchPlaceholder = "Search...",
  select = false,
  onSelectionChange,
}: ActionMenuListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);

  const getAllItems = useCallback((): ReactElement[] => {
    const items: ReactElement[] = [];

    React.Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;

      if ((child.type as any).name === "ActionMenuItem") {
        items.push(child);
      } else if ((child as ReactElement<any>).props?.children) {
        const typedChild = child as ReactElement<any>;
        React.Children.forEach(typedChild.props.children, (subChild) => {
          if (
            isValidElement(subChild) &&
            (subChild.type as any).name === "ActionMenuItem"
          ) {
            items.push(subChild);
          }
        });
      }
    });

    return items;
  }, [children]);

  const allItems = getAllItems();

  const filteredItems =
    searchQuery.trim() === ""
      ? allItems
      : allItems.filter((item) => {
          const typedItem = item as ReactElement<any>;
          const label = String(typedItem.props.children || "").toLowerCase();
          return label.includes(searchQuery.toLowerCase());
        });

  useEffect(() => {
    if (search && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [search]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  const handleSearchKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            Math.min(prev + 1, filteredItems.length - 1),
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (itemsRef.current[highlightedIndex]) {
            itemsRef.current[highlightedIndex]?.click();
          }
          break;
        case "Escape":
          e.preventDefault();
          setSearchQuery("");
          break;
        default:
          break;
      }
    },
    [filteredItems.length, highlightedIndex],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  }, []);

  const handleItemSelect = useCallback(
    (itemLabel: string) => {
      if (!select) return;

      setSelectedItems((prev) => {
        const newSelected = new Set(prev);
        if (newSelected.has(itemLabel)) {
          newSelected.delete(itemLabel);
        } else {
          newSelected.clear();
          newSelected.add(itemLabel);
        }
        onSelectionChange?.(Array.from(newSelected));
        return newSelected;
      });
    },
    [select, onSelectionChange],
  );

  const isItemSelected = useCallback(
    (itemLabel: string) => selectedItems.has(itemLabel),
    [selectedItems],
  );

  const wrapChildrenWithSelection = useCallback(
    (items: ReactNode): ReactNode => {
      if (!select) return items;

      return Children.map(items, (child) => {
        if (!isValidElement(child)) return child;

        const typedChild = child as ReactElement<any>;

        if ((typedChild.type as any).name === "ActionMenuItem") {
          const itemLabel = String(typedChild.props.children || "");
          const isSelected = isItemSelected(itemLabel);

          return cloneElement(typedChild, {
            ...typedChild.props,
            selected: isSelected,
            selectionVariant: "single" as const,
            onSelect: () => {
              handleItemSelect(itemLabel);
              typedChild.props.onSelect?.();
            },
          });
        }

        if ((typedChild.type as any).name === "ActionMenuGroup") {
          const wrappedGroupItems = Children.map(
            typedChild.props.children,
            (subChild) => {
              if (!isValidElement(subChild)) return subChild;
              const typedSubChild = subChild as ReactElement<any>;
              if ((typedSubChild.type as any).name !== "ActionMenuItem")
                return typedSubChild;

              const itemLabel = String(typedSubChild.props.children || "");
              const isSelected = isItemSelected(itemLabel);

              return cloneElement(typedSubChild, {
                ...typedSubChild.props,
                selected: isSelected,
                selectionVariant: "single" as const,
                onSelect: () => {
                  handleItemSelect(itemLabel);
                  typedSubChild.props.onSelect?.();
                },
              });
            },
          );

          return cloneElement(typedChild, {
            children: wrappedGroupItems,
          });
        }

        return typedChild;
      });
    },
    [select, isItemSelected, handleItemSelect],
  );
  const renderFilteredChildren = useCallback(() => {
    if (!search || searchQuery.trim() === "") {
      return wrapChildrenWithSelection(children);
    }

    return Children.map(wrapChildrenWithSelection(children), (child) => {
      if (!isValidElement(child)) return child;

      const typedChild = child as ReactElement<any>;
      const typeName = (typedChild.type as any).name;

      if (typeName !== "ActionMenuGroup" && typeName !== "ActionMenuItem") {
        return typedChild;
      }

      if (typeName === "ActionMenuGroup") {
        const filteredGroupItems = Children.toArray(
          typedChild.props.children,
        ).filter((subChild) => {
          if (!isValidElement(subChild)) return false;
          const typedSubChild = subChild as ReactElement<any>;
          if ((typedSubChild.type as any).name !== "ActionMenuItem")
            return false;

          const label = String(
            typedSubChild.props.children || "",
          ).toLowerCase();
          return label.includes(searchQuery.toLowerCase());
        });

        if (filteredGroupItems.length === 0) return null;

        return cloneElement(typedChild, {
          children: filteredGroupItems,
        });
      }

      // ActionMenuItem
      const label = String(typedChild.props.children || "").toLowerCase();
      return label.includes(searchQuery.toLowerCase()) ? typedChild : null;
    });
  }, [search, searchQuery, children, wrapChildrenWithSelection]);
  return (
    <>
      {search && (
        <div className="relative px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent"
              aria-label="Search menu items"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {filteredItems.length === 0 && searchQuery && (
            <div className="px-3 py-6 text-center text-sm text-neutral-500">
              No items found
            </div>
          )}
        </div>
      )}

      <ul className={cn("py-1 text-sm", className)}>
        {search
          ? renderFilteredChildren()
          : wrapChildrenWithSelection(children)}
      </ul>
    </>
  );
}

function ActionMenuItem({
  children,
  onSelect,
  leadingIcon,
  trailingVisual,
  shortcut,
  variant = "default",
  disabled = false,
  selected = false,
  selectionVariant,
  description,
  className,
  select = false,
}: ActionMenuItemProps) {
  const { closeMenu } = useActionMenu();

  const handleActivate = useCallback(() => {
    if (disabled) return;
    onSelect?.();
    if (!select) {
      closeMenu();
    }
  }, [disabled, onSelect, closeMenu, select]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLLIElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleActivate();
      }
    },
    [handleActivate],
  );

  const isDanger = variant === "danger";

  return (
    <li
      role="menuitem"
      tabIndex={-1}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg cursor-pointer select-none outline-none transition-colors duration-100",
        isDanger
          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
          : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      {selectionVariant && (
        <div className="w-4 flex items-center justify-center">
          {selected && <Check className="w-4 h-4" />}
        </div>
      )}

      {!selectionVariant && leadingIcon && (
        <span className="text-neutral-500">{leadingIcon}</span>
      )}

      <div className="flex-1 min-w-0">
        <div>{children}</div>
        {description && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {description}
          </div>
        )}
      </div>

      {shortcut && (
        <span className="text-xs text-neutral-400 font-mono">{shortcut}</span>
      )}

      {!shortcut && trailingVisual && <span>{trailingVisual}</span>}
    </li>
  );
}

function ActionMenuSubmenuItem({
  children,
  leadingIcon,
  description,
  className,
}: ActionMenuSubmenuItemProps) {
  const { toggleMenu, open } = useActionMenu();

  return (
    <li
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={open}
      tabIndex={0}
      onClick={toggleMenu}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
          e.preventDefault();
          toggleMenu();
        }
      }}
      className={cn(
        "group relative flex items-start gap-2.5 px-3 py-2 mx-1.5 rounded-lg cursor-pointer select-none outline-none transition-colors duration-100 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600",
        open && "bg-neutral-100 dark:bg-neutral-800/80",
        className,
      )}
    >
      {leadingIcon && <span>{leadingIcon}</span>}
      <div className="flex-1">
        {children}
        {description && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {description}
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 opacity-60" />
    </li>
  );
}

function ActionMenuDivider() {
  return <li className="h-px bg-neutral-200 dark:bg-neutral-700 my-1 mx-3" />;
}

let groupIdCounter = 0;

function ActionMenuGroup({ label, children, className }: ActionMenuGroupProps) {
  const labelId = useRef(`amg-${++groupIdCounter}`).current;

  return (
    <li role="group" aria-labelledby={labelId}>
      {label && (
        <div
          id={labelId}
          className="px-3 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-widest"
        >
          {label}
        </div>
      )}
      <ul className={cn("py-1", className)}>{children}</ul>
    </li>
  );
}

function ActionMenuHeader({ children, className }: ActionMenuHeaderProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 text-sm font-medium",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ActionMenuFooter({ children, className }: ActionMenuFooterProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 border-t border-neutral-200 dark:border-neutral-700",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ActionMenuNested({
  children,
  position = "right-start",
  ...rest
}: ActionMenuNestedProps) {
  return (
    <ActionMenuRoot {...rest} nested position={position}>
      {children}
    </ActionMenuRoot>
  );
}

// ====================== EXPORT ======================

export const ActionMenu = Object.assign(ActionMenuRoot, {
  Anchor: ActionMenuAnchor,
  Button: ActionMenuButton,
  Overlay: ActionMenuOverlay,
  List: ActionMenuList,
  Item: ActionMenuItem,
  SubmenuItem: ActionMenuSubmenuItem,
  Divider: ActionMenuDivider,
  Group: ActionMenuGroup,
  Header: ActionMenuHeader,
  Footer: ActionMenuFooter,
  Nested: ActionMenuNested,
});

export default ActionMenu;
