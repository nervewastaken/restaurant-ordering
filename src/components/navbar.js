import * as React from "react";
import { forwardRef, ref } from "react";
import { Popper } from "@mui/base/Popper";
import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Chip from "@mui/joy/Chip";
import List from "@mui/joy/List";
import ListDivider from "@mui/joy/ListDivider";
import ListItem from "@mui/joy/ListItem";
import ListItemContent from "@mui/joy/ListItemContent";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import HomeRounded from "@mui/icons-material/HomeRounded";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Person from "@mui/icons-material/Person";
import Apps from "@mui/icons-material/Apps";
import FactCheck from "@mui/icons-material/FactCheck";
import BookmarkAdd from "@mui/icons-material/BookmarkAdd";
import Link from "next/link";
import Hero from "./hero";

const useRovingIndex = (options) => {
  const {
    initialActiveIndex = 0,
    vertical = false,
    handlers = {
      onKeyDown: () => {},
    },
  } = options || {};
  const [activeIndex, setActiveIndex] = React.useState(initialActiveIndex);
  const targetRefs = React.useRef([]);
  const targets = targetRefs.current;
  const focusNext = () => {
    let newIndex = activeIndex + 1;
    if (newIndex >= targets.length) {
      newIndex = 0;
    }
    targets[newIndex]?.focus();
    setActiveIndex(newIndex);
  };
  const focusPrevious = () => {
    let newIndex = activeIndex - 1;
    if (newIndex < 0) {
      newIndex = targets.length - 1;
    }
    targets[newIndex]?.focus();
    setActiveIndex(newIndex);
  };
  const getTargetProps = (index) => ({
    ref: (ref) => {
      if (ref) {
        targets[index] = ref;
      }
    },
    tabIndex: activeIndex === index ? 0 : -1,
    onKeyDown: (e) => {
      if (Number.isInteger(activeIndex)) {
        if (e.key === (vertical ? "ArrowDown" : "ArrowRight")) {
          focusNext();
        }
        if (e.key === (vertical ? "ArrowUp" : "ArrowLeft")) {
          focusPrevious();
        }
        handlers.onKeyDown?.(e, { setActiveIndex });
      }
    },
    onClick: () => {
      setActiveIndex(index);
    },
  });
  return {
    activeIndex,
    setActiveIndex,
    targets,
    getTargetProps,
    focusNext,
    focusPrevious,
  };
};

const AboutMenu = forwardRef(({ focusNext, focusPrevious, ...props }, ref) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { targets, setActiveIndex, getTargetProps } = useRovingIndex({
    initialActiveIndex: null,
    vertical: true,
    handlers: {
      onKeyDown: (event, fns) => {
        if (event.key.match(/(ArrowDown|ArrowUp|ArrowLeft|ArrowRight)/)) {
          event.preventDefault();
        }
        if (event.key === "Tab") {
          setAnchorEl(null);
          fns.setActiveIndex(null);
        }
        if (event.key === "ArrowLeft") {
          setAnchorEl(null);
          focusPrevious();
        }
        if (event.key === "ArrowRight") {
          setAnchorEl(null);
          focusNext();
        }
      },
    },
  });

  const open = Boolean(anchorEl);
  const id = open ? "contact-popper" : undefined;
  return (
    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
      <div onMouseLeave={() => setAnchorEl(null)}>
        <ListItemButton
          aria-haspopup
          aria-expanded={open ? "true" : "false"}
          ref={ref}
          {...props}
          role="menuitem"
          onKeyDown={(event) => {
            props.onKeyDown?.(event);
            if (event.key.match(/(ArrowLeft|ArrowRight|Tab)/)) {
              setAnchorEl(null);
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              targets[0]?.focus();
              setActiveIndex(0);
            }
          }}
          onFocus={(event) => setAnchorEl(event.currentTarget)}
          onMouseEnter={(event) => {
            props.onMouseEnter?.(event);
            setAnchorEl(event.currentTarget);
          }}
          sx={(theme) => ({
            ...(open && theme.variants.plainHover.neutral),
          })}
        >
          <Link href={"/about"}>About</Link>
        </ListItemButton>
      </div>
    </ClickAwayListener>
  );
});

AboutMenu.displayName = "AboutMenu";

const ContactMenu = forwardRef(
  ({ focusNext, focusPrevious, ...props }, ref) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const { targets, setActiveIndex, getTargetProps } = useRovingIndex({
      initialActiveIndex: null,
      vertical: true,
      handlers: {
        onKeyDown: (event, fns) => {
          if (event.key.match(/(ArrowDown|ArrowUp|ArrowLeft|ArrowRight)/)) {
            event.preventDefault();
          }
          if (event.key === "Tab") {
            setAnchorEl(null);
            fns.setActiveIndex(null);
          }
          if (event.key === "ArrowLeft") {
            setAnchorEl(null);
            focusPrevious();
          }
          if (event.key === "ArrowRight") {
            setAnchorEl(null);
            focusNext();
          }
        },
      },
    });

    const open = Boolean(anchorEl);
    const id = open ? "contact-popper" : undefined;
    return (
      <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
        <div onMouseLeave={() => setAnchorEl(null)}>
          <ListItemButton
            aria-haspopup
            aria-expanded={open ? "true" : "false"}
            ref={ref}
            {...props}
            role="menuitem"
            onKeyDown={(event) => {
              props.onKeyDown?.(event);
              if (event.key.match(/(ArrowLeft|ArrowRight|Tab)/)) {
                setAnchorEl(null);
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                targets[0]?.focus();
                setActiveIndex(0);
              }
            }}
            onFocus={(event) => setAnchorEl(event.currentTarget)}
            onMouseEnter={(event) => {
              props.onMouseEnter?.(event);
              setAnchorEl(event.currentTarget);
            }}
            sx={(theme) => ({
              ...(open && theme.variants.plainHover.neutral),
            })}
          >
            <Link href={"/contact"}>Get in Touch</Link>
          </ListItemButton>
        </div>
      </ClickAwayListener>
    );
  }
);

ContactMenu.displayName = "ContactMenu";

const MenuButton = forwardRef(({ href, icon, children, ...props }, ref) => {
  return (
    <ListItemButton
      component={Link}
      href={href}
      ref={ref}
      {...props}
      role="menuitem"
      sx={(theme) => ({
        ...(props.active && theme.variants.plainHover.neutral),
      })}
    >
      {icon && <ListItemDecorator>{icon}</ListItemDecorator>}
      {children}
    </ListItemButton>
  );
});

MenuButton.displayName = "MenuButton";

export default function NavigationMenu() {
  const { getTargetProps, setActiveIndex, focusNext, focusPrevious } =
    useRovingIndex();

  return (
    <div className="flex justify-center items-center mt-4">
      <Box sx={{ minHeight: 190 }}>
        <List
          role="menubar"
          orientation="horizontal"
          sx={{
            "--List-radius": "8px",
            "--List-padding": "4px",
            "--List-gap": "8px",
            "--ListItem-gap": "0px",
          }}
        >
          <ListItem role="none">
            <MenuButton
              href="/"
              icon={<HomeRounded />}
              {...getTargetProps(0)}
              onMouseEnter={() => {
                setActiveIndex(0);
              }}
            >
              Home
            </MenuButton>
          </ListItem>
          <ListItem role="none">
            <MenuButton
              href="/about"
              {...getTargetProps(1)}
              onMouseEnter={() => {
                setActiveIndex(1);
              }}
            >
              About
            </MenuButton>
          </ListItem>
          <ListItem role="none">
            <MenuButton
              href="/contact"
              {...getTargetProps(2)}
              onMouseEnter={() => {
                setActiveIndex(2);
              }}
            >
              Get in Touch
            </MenuButton>
          </ListItem>
          <ListItem>
            <Hero />
          </ListItem>
        </List>
      </Box>
    </div>
  );
}
