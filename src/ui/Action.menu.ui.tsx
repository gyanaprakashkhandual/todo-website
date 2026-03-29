/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  forwardRef,
  useRef,
  useCallback,
  useEffect,
  cloneElement,
  isValidElement,
  Children,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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

// Root component — provides context & positioning wrapper
export interface ActionMenuProps extends Omit<
  ActionMenuProviderProps,
  "nested"
> {
  nested?: boolean;
  closeOnClickOutside?: boolean;
}

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
      <div className="relative inline-block">{children}</div>
    </ActionMenuProvider>
  );
}

// Custom trigger wrapper
export interface ActionMenuAnchorProps {
  children: React.ReactElement;
}

function ActionMenuAnchor({ children }: ActionMenuAnchorProps) {
  const { anchorRef, toggleMenu, open, menuId } = useActionMenu();

  const child = Children.only(children);
  if (!isValidElement(child)) {
    throw new Error(
      "<ActionMenu.Anchor> requires exactly one React element child.",
    );
  }

  return cloneElement(child as React.ReactElement<Record<string, unknown>>, {
    ref: anchorRef,
    onClick: (e: React.MouseEvent) => {
      (
        child.props as Record<string, unknown> & {
          onClick?: (e: React.MouseEvent) => void;
        }
      ).onClick?.(e);
      toggleMenu();
    },
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
  });
}

// Styled trigger button
export interface ActionMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  leadingIcon?: React.ReactNode;
  showChevron?: boolean;
  variant?: "default" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<string, string> = {
  default:
    "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 active:bg-neutral-100 dark:active:bg-neutral-700  ",
  danger:
    "bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50  ",
  ghost:
    "bg-transparent border border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800",
  outline:
    "bg-transparent border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800  ",
};

const sizeClasses: Record<string, string> = {
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
    _forwardedRef,
  ) {
    const { anchorRef, toggleMenu, open, menuId } = useActionMenu();

    return (
      <button
        ref={anchorRef as React.RefObject<HTMLButtonElement>}
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
        {leadingIcon && (
          <span className="shrink-0 text-neutral-500 dark:text-neutral-400">
            {leadingIcon}
          </span>
        )}
        <span className="truncate">{children}</span>
        {showChevron && (
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="shrink-0 text-neutral-400 dark:text-neutral-500 ml-auto"
          >
            <ChevronDown size={14} strokeWidth={2.5} />
          </motion.span>
        )}
      </button>
    );
  },
);

// Floating overlay panel (portaled)
export interface ActionMenuOverlayProps {
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}

import { type Variants } from "framer-motion";

const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeInOut",
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.14,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeInOut",
    },
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
          aria-orientation="vertical"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={style}
          className={cn(
            "overflow-y-auto overscroll-contain rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-900/10 dark:shadow-black/40 ring-1 ring-neutral-900/5 dark:ring-white/5",
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

// List container + optional built-in search & selection
export interface ActionMenuListProps {
  children: React.ReactNode;
  className?: string;
  search?: boolean;
  searchPlaceholder?: string;
  select?: boolean;
  onSelectionChange?: (selectedItems: string[]) => void;
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
  const itemsRef = useRef<HTMLLIElement[]>([]);

  const getAllItems = useCallback(() => {
    const items: React.ReactElement[] = [];

    React.Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        if (child.type && (child.type as any).name === "ActionMenuItem") {
          items.push(child);
        } else if (child.props?.children) {
          React.Children.forEach(child.props.children, (subChild) => {
            if (
              isValidElement(subChild) &&
              (subChild.type as any).name === "ActionMenuItem"
            ) {
              items.push(subChild);
            }
          });
        }
      }
    });

    return items;
  }, [children]);

  const allItems = getAllItems();

  const filteredItems =
    searchQuery.trim() === ""
      ? allItems
      : allItems.filter((item) => {
          const label = String(item.props.children || "").toLowerCase();
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
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        // For single selection: always replace with the new item
        // Only deselect if clicking the same item twice
        if (newSelected.has(itemLabel)) {
          newSelected.delete(itemLabel);
        } else {
          // Clear all and add only this item (single selection)
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
    (itemLabel: string) => {
      return selectedItems.has(itemLabel);
    },
    [selectedItems],
  );

  const renderFilteredChildren = useCallback(() => {
    if (!search || searchQuery.trim() === "") {
      return wrapChildrenWithSelection(children);
    }

    return React.Children.map(wrapChildrenWithSelection(children), (child) => {
      if (!isValidElement(child)) return child;

      if (
        (child.type as any).name !== "ActionMenuGroup" &&
        (child.type as any).name !== "ActionMenuItem"
      ) {
        return child;
      }

      if ((child.type as any).name === "ActionMenuGroup") {
        const filteredGroupItems = React.Children.toArray(
          child.props.children,
        ).filter((subChild) => {
          if (!isValidElement(subChild)) return false;
          if ((subChild.type as any).name !== "ActionMenuItem") return false;
          const label = String(subChild.props.children || "").toLowerCase();
          return label.includes(searchQuery.toLowerCase());
        });

        if (filteredGroupItems.length === 0) return null;

        return React.cloneElement(child as React.ReactElement, {
          children: filteredGroupItems,
        });
      }

      if ((child.type as any).name === "ActionMenuItem") {
        const label = String(child.props.children || "").toLowerCase();
        if (label.includes(searchQuery.toLowerCase())) {
          return child;
        }
      }

      return null;
    });
  }, [search, searchQuery, children, select, handleItemSelect, isItemSelected]);

  const wrapChildrenWithSelection = useCallback(
    (items: React.ReactNode) => {
      if (!select) return items;

      return React.Children.map(items, (child) => {
        if (!isValidElement(child)) return child;

        if ((child.type as any).name === "ActionMenuItem") {
          const itemLabel = String(child.props.children || "");
          const isSelected = isItemSelected(itemLabel);

          return React.cloneElement(child as React.ReactElement, {
            ...child.props,
            selected: isSelected,
            selectionVariant: "single",
            onSelect: () => {
              handleItemSelect(itemLabel);
              child.props.onSelect?.();
            },
          });
        }

        if ((child.type as any).name === "ActionMenuGroup") {
          const wrappedGroupItems = React.Children.map(
            child.props.children,
            (subChild) => {
              if (!isValidElement(subChild)) return subChild;

              if ((subChild.type as any).name === "ActionMenuItem") {
                const itemLabel = String(subChild.props.children || "");
                const isSelected = isItemSelected(itemLabel);

                return React.cloneElement(subChild as React.ReactElement, {
                  ...subChild.props,
                  selected: isSelected,
                  selectionVariant: "single",
                  onSelect: () => {
                    handleItemSelect(itemLabel);
                    subChild.props.onSelect?.();
                  },
                });
              }
              return subChild;
            },
          );

          return React.cloneElement(child as React.ReactElement, {
            children: wrappedGroupItems,
          });
        }

        return child;
      });
    },
    [select, isItemSelected, handleItemSelect],
  );

  return (
    <>
      {search && (
        <div className="px-3 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent"
              aria-label="Search menu items"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
                aria-label="Clear search"
              >
                <XIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              </button>
            )}
          </div>
          {filteredItems.length === 0 && searchQuery && (
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 text-center">
              No items found
            </p>
          )}
        </div>
      )}
      <ul role="presentation" className={cn("py-1.5", className)}>
        {search ? renderFilteredChildren() : children}
      </ul>
    </>
  );
}

// Individual menu item
export interface ActionMenuItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  leadingIcon?: React.ReactNode;
  trailingVisual?: React.ReactNode;
  shortcut?: string;
  variant?: "default" | "danger";
  disabled?: boolean;
  selected?: boolean;
  selectionVariant?: "single" | "multiple";
  description?: string;
  className?: string;
  /** If true, menu will not close when this item is clicked */
  select?: boolean;
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
    (e: React.KeyboardEvent) => {
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
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex items-start gap-2.5 px-3 py-2 mx-1.5 rounded-lg cursor-pointer select-none outline-none transition-colors duration-100",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : isDanger
            ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
            : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80",
        className,
      )}
    >
      {selectionVariant && (
        <span className="mt-0.5 shrink-0 w-4 flex items-center justify-center">
          {selected && (
            <Check
              size={13}
              strokeWidth={2.5}
              className="text-neutral-900 dark:text-neutral-100"
            />
          )}
        </span>
      )}

      {!selectionVariant && leadingIcon && (
        <span
          className={cn(
            "mt-0.5 shrink-0",
            isDanger
              ? "text-red-500 dark:text-red-400"
              : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300",
          )}
        >
          {leadingIcon}
        </span>
      )}

      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium leading-5 truncate">
          {children}
        </span>
        {description && (
          <span className="block text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-4">
            {description}
          </span>
        )}
      </span>

      {shortcut && (
        <kbd className="shrink-0 mt-0.5 text-[11px] font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-1 py-0.5 leading-none">
          {shortcut}
        </kbd>
      )}
      {!shortcut && trailingVisual && (
        <span className="shrink-0 mt-0.5 text-neutral-400 dark:text-neutral-500">
          {trailingVisual}
        </span>
      )}
    </li>
  );
}

// Submenu trigger item (used inside list)
export interface ActionMenuSubmenuItemProps {
  children: React.ReactNode;
  leadingIcon?: React.ReactNode;
  description?: string;
  className?: string;
}

function ActionMenuSubmenuItem({
  children,
  leadingIcon,
  description,
  className,
}: ActionMenuSubmenuItemProps) {
  const { anchorRef, toggleMenu, open } = useActionMenu();

  return (
    <li
      ref={anchorRef as React.RefObject<HTMLLIElement>}
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={open}
      tabIndex={0}
      onClick={toggleMenu}
      onKeyDown={(e) => {
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
      {leadingIcon && (
        <span className="mt-0.5 shrink-0 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
          {leadingIcon}
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium leading-5 truncate">
          {children}
        </span>
        {description && (
          <span className="block text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-4">
            {description}
          </span>
        )}
      </span>
      <span className="mt-0.5 shrink-0 text-neutral-400 dark:text-neutral-500">
        <ChevronRight size={14} strokeWidth={2} />
      </span>
    </li>
  );
}

// Separator line
function ActionMenuDivider() {
  return (
    <li
      role="separator"
      aria-orientation="horizontal"
      className="my-1.5 mx-0 h-px bg-neutral-100 dark:bg-neutral-800"
    />
  );
}

// Labelled group
export interface ActionMenuGroupProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

let groupIdCounter = 0;
function ActionMenuGroup({ label, children, className }: ActionMenuGroupProps) {
  const labelId = useRef(`amg-${++groupIdCounter}`).current;
  return (
    <li role="presentation" className={cn("", className)}>
      {label && (
        <div
          id={labelId}
          role="presentation"
          className="px-4 pt-2 pb-1 text-[11px] font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 select-none"
        >
          {label}
        </div>
      )}
      <ul role="group" aria-labelledby={label ? labelId : undefined}>
        {children}
      </ul>
    </li>
  );
}

// Optional header inside overlay
export interface ActionMenuHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function ActionMenuHeader({ children, className }: ActionMenuHeaderProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 text-sm font-semibold text-neutral-900 dark:text-neutral-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Optional footer inside overlay
export interface ActionMenuFooterProps {
  children: React.ReactNode;
  className?: string;
}

function ActionMenuFooter({ children, className }: ActionMenuFooterProps) {
  return (
    <div
      className={cn(
        "px-3 py-2 border-t border-neutral-100 dark:border-neutral-800",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Nested menu root (defaults to right-start positioning)
export interface ActionMenuNestedProps extends Omit<
  ActionMenuProps,
  "nested" | "position"
> {
  position?: MenuPosition;
}

function ActionMenuNested({
  children,
  position = "right-start",
  ...rest
}: ActionMenuNestedProps) {
  return (
    <ActionMenuRoot nested position={position} {...rest}>
      {children}
    </ActionMenuRoot>
  );
}

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