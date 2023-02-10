import React from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wrap } from "@popmotion/popcorn";
import "./styles.css";

/**
 * Using AnimatePresence and drag for a slideshow
 *
 * Add and remove pages from the array to checkout how the gestures
 * and pagination animations are fully data and layout-driven.
 */

const pages = [0, 1, 2, 3];

export default function App() {
  /*
   * We keep track of the pagination direction as well as current page, this way we
   * can dynamically generate different animations depending on the direction of travel
   */
  const [[currentPage, direction], setCurrentPage] = useState([0, 0]);

  const [shouldRenderSibling, setShouldRenderSibling] = useState(false);

  function setPage(newPage, newDirection) {
    if (!newDirection) newDirection = newPage - currentPage;
    setCurrentPage([newPage, newDirection]);
  }

  function handleResize() {
    setShouldRenderSibling(window.visualViewport.width > 500);
  }

  window.addEventListener("resize", handleResize);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "row" }}>
        {shouldRenderSibling && (
          <SiblingSlide
            currentPage={
              currentPage - 1 < 0 ? pages.length - 1 : currentPage - 1
            }
            direction={direction}
            setPage={setPage}
            buttonDirection={-1}
          />
        )}

        <Slides
          currentPage={currentPage}
          direction={direction}
          setPage={setPage}
        />

        {shouldRenderSibling && (
          <SiblingSlide
            currentPage={currentPage + 1 >= pages.length ? 0 : currentPage + 1}
            direction={direction}
            setPage={setPage}
            buttonDirection={1}
          />
        )}
      </div>
    </>
  );
}

/**
 * Variants define visual states that a motion component can be in at any given time.
 * These can be dynamic - here the enter and exit variants are functions that return
 * different values based on the current direction.
 */

const xOffset = 200;
const xOffset2 = 3;
const variants = {
  enter: (direction) => ({
    x: direction > 0 ? xOffset : -xOffset,
    transition: {
      duration: 0.2
    },
    scale: 0.5
  }),
  active: {
    x: 0,
    transition: {
      delay: 0,
      duration: 0.2
    },
    scale: 1
  },
  exit: (direction) => ({
    x: direction > 0 ? -xOffset : xOffset,
    transition: {
      duration: 0.2
    },
    scale: 0.5
  })
};

const variantsForSiblings = {
  enter: (direction) => ({
    x: direction > 0 ? xOffset2 : -xOffset2,
    opacity: 0,
    transition: {
      duration: 0.2
    },
    scale: 0.5
  }),
  active: {
    x: 0,
    opacity: 1,
    transition: {
      delay: 0,
      duration: 0.2
    },
    scale: 1
  },
  exit: (direction) => ({
    x: direction > 0 ? xOffset2 : -xOffset2,
    opacity: 0,
    transition: {
      duration: 0.2
    },
    scale: 0.5
  })
};

function Slides({ currentPage, setPage, direction }) {
  const hasPaginated = useRef(false);

  function detectPaginationGesture(e, { offset }) {
    if (hasPaginated.current) return;
    let newPage = currentPage;
    const threshold = xOffset / 2;

    if (offset.x < -threshold) {
      // If we're dragging left, go forward a page
      newPage = currentPage + 1;
    } else if (offset.x > threshold) {
      // If we're dragging right, go backwards a page
      newPage = currentPage - 1;
    }

    if (newPage !== currentPage) {
      hasPaginated.current = true;
      // Wrap the page index to within the permitted page range
      newPage = wrap(0, pages.length, newPage);
      setPage(newPage, offset.x < 0 ? 1 : -1);
    }
  }

  return (
    <div className="slider-container">
      <AnimatePresence
        // Disable entry animations when AnimatePresence mounts, but allow
        // them when new children enter.
        initial={false}
        // This will be used for components to resolve exit variants. It's neccessary
        // as removed components won't rerender with the latest state (as they've been removed)
        custom={direction}
      >
        <motion.div
          // Changing the key of the component remounts it - we are creating a new slide
          // per page. This is why we see multiple slides at once despite only rendering
          // one component at a time.
          key={currentPage}
          className="slide"
          data-page={currentPage}
          variants={variants}
          initial="enter"
          animate="active"
          exit="exit"
          drag="x"
          onDrag={detectPaginationGesture}
          onDragStart={() => (hasPaginated.current = false)}
          onDragEnd={() => (hasPaginated.current = true)}
          // Snap the component back to the center if it hasn't paginated
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          // This will be used for components to resolve all other variants, in
          // this case initial and animate.
          custom={direction}
        />
      </AnimatePresence>
    </div>
  );
}

function SiblingSlide({ currentPage, setPage, direction, buttonDirection }) {
  function changePage() {
    setPage(currentPage, buttonDirection);
  }

  return (
    <div className="slider-container">
      <AnimatePresence
        // Disable entry animations when AnimatePresence mounts, but allow
        // them when new children enter.
        initial={false}
        // This will be used for components to resolve exit variants. It's neccessary
        // as removed components won't rerender with the latest state (as they've been removed)
        custom={direction}
      >
        <motion.div
          // Changing the key of the component remounts it - we are creating a new slide
          // per page. This is why we see multiple slides at once despite only rendering
          // one component at a time.
          key={currentPage}
          className="slideSibling"
          data-page={currentPage}
          variants={variantsForSiblings}
          initial="enter"
          animate="active"
          exit="exit"
          onClick={changePage}
          custom={direction}
        />
      </AnimatePresence>
    </div>
  );
}
