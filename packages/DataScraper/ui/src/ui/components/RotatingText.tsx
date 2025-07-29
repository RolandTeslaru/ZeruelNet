import React, {
  useEffect,
  useMemo,
  useState,
  useLayoutEffect,
  useRef,
} from "react";
import {
  motion,
  AnimatePresence,
  Transition,
  type VariantLabels,
  type Target,
  type TargetAndTransition,
} from "motion/react";

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

export interface RotatingTextProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof motion.span>,
    "children" | "transition" | "initial" | "animate" | "exit"
  > {
  data?: {
    title: string;
    type: 'INFO' | 'TASK' | 'SUCCESS' | 'FAILURE';
  };
  transition?: Transition;
  initial?: boolean | Target | VariantLabels;
  animate?: boolean | VariantLabels | TargetAndTransition;
  exit?: Target | VariantLabels;
  animatePresenceMode?: "sync" | "wait";
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

const RotatingText: React.FC<RotatingTextProps> = (
  {
    data,
    transition = { type: "spring", damping: 25, stiffness: 300 },
    initial = { y: "100%", opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: "-120%", opacity: 0 },
    animatePresenceMode = "wait",
    animatePresenceInitial = true,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = "first",
    loop = true,
    auto = true,
    splitBy = "characters",
    onNext,
    mainClassName,
    splitLevelClassName,
    ...rest
  },
) => {
  const [currentData, setCurrentData] = useState(data);
  const [isAnimating, setIsAnimating] = useState(false);
  const [width, setWidth] = useState<number | "auto">("auto")
  const sizerRef = useRef<HTMLSpanElement>(null)
  const dummyTextRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (dummyTextRef.current && width === 'auto') {
      setWidth(dummyTextRef.current.clientWidth);
    }
  }, [width]);

  useEffect(() => {
    // This is Step 1: Detect a change from the parent.
    // If the desired text (from props) is different from what's on screen,
    // start the exit process.
    if (data?.title !== currentData?.title) {
      // Just set animating to true. This makes the current text solid
      // and prepares it for its exit animation.
      setIsAnimating(true);
    }
  }, [data, currentData]);


  useLayoutEffect(() => {
    // This is Step 2: This runs AFTER the component re-renders with isAnimating=true.
    // Now that the old text is solid, we can safely trigger the animation
    // by updating what's on screen.
    if (isAnimating) {
      setCurrentData(data);
    }
  }, [isAnimating, data]);

  const styleMap = {
    INFO: {
      className: 'animate-pulse text-cyan-200',
      elementLevelClassName: '',
    },
    TASK: {
      className: 'bg-gradient-to-r from-cyan-200 via-cyan-400 to-cyan-300 bg-clip-text bg-[length:200%_auto] animate-shimmer',
      elementLevelClassName: 'text-cyan-400 group-[.is-settled]:text-transparent',
    },
    SUCCESS: {
      className: 'text-green-300 animate-pulse',
      elementLevelClassName: '',
    },
    FAILURE: {
      className: 'text-red-500 animate-pulse',
      elementLevelClassName: '',
    },
  };

  const containerVariants = {
    enter: {
      transition: {
        staggerChildren: staggerDuration,
        staggerDirection: staggerFrom === 'last' ? -1 : 1,
      },
    },
    exit: {
      transition: {
        staggerChildren: staggerDuration,
        staggerDirection: staggerFrom === 'last' ? -1 : 1,
      },
      whiteSpace: 'nowrap',
    },
  };

  const letterVariants = {
    initial: { y: "100%", opacity: 0 },
    enter: { y: 0, opacity: 1 },
    exit: { y: "-120%", opacity: 0 },
  };

  const splitIntoCharacters = (text: string): string[] => {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      return Array.from(
        segmenter.segment(text),
        (segment) => segment.segment
      );
    }
    return Array.from(text);
  };

  const currentStyles = currentData ? styleMap[currentData.type] : { className: '', elementLevelClassName: '' };
  const currentText = currentData ? currentData.title : '';

  const elements = useMemo(() => {
    if (!currentText) return [];
    if (splitBy === "characters") {
      const words = currentText.split(" ");
      return words.map((word, i) => ({
        characters: splitIntoCharacters(word),
        needsSpace: i !== words.length - 1,
      }));
    }
    if (splitBy === "words") {
      return currentText.split(" ").map((word, i, arr) => ({
        characters: [word],
        needsSpace: i !== arr.length - 1,
      }));
    }
    if (splitBy === "lines") {
      return currentText.split("\n").map((line, i, arr) => ({
        characters: [line],
        needsSpace: i !== arr.length - 1,
      }));
    }

    return currentText.split(splitBy).map((part, i, arr) => ({
      characters: [part],
      needsSpace: i !== arr.length - 1,
    }));
  }, [currentText, splitBy]);


  return (
    <>
      {/* Invisible Sizer for measurement */}

      <motion.span
        className={cn(
          `flex flex-wrap whitespace-nowrap relative`
          ,
          mainClassName
        )}
        {...rest}
        animate={{ width }}
        transition={transition}
        ref={sizerRef}
      >
        <span
          ref={dummyTextRef}
          className="opacity-0 absolute whitespace-pre-wrap !text-nowrap"
        >
          {currentData?.title}
        </span>
        <AnimatePresence
          mode="wait"
          initial={animatePresenceInitial}
        >
          {currentData && (
            <motion.span
              key={currentData.title}
              className={cn(
                'flex content-start whitespace-nowrap group',
                currentStyles.className,
                !isAnimating && 'is-settled'
              )}
              variants={containerVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              onAnimationStart={(definition) => {
                if (definition === "enter") {
                  if (dummyTextRef.current) {
                    setWidth(dummyTextRef.current.clientWidth + 25);
                  }
                }
              }}
              onAnimationComplete={(definition) => {
                if (definition === "enter") {
                  setIsAnimating(false);
                }
              }}
              aria-hidden="true"
            >
              {elements.map((wordObj, wordIndex, array) => (
                <span
                  key={wordIndex}
                  className={cn('inline-flex', splitLevelClassName)}
                >
                  {wordObj.characters.map((char, charIndex) => (
                    <motion.span
                      key={charIndex}
                      variants={letterVariants}
                      transition={transition}
                      className={cn(
                        'inline-block',
                        currentStyles.elementLevelClassName
                      )}
                    >
                      {char}
                    </motion.span>
                  ))}
                  {wordObj.needsSpace && <span className=" whitespace-pre-wrap ">&nbsp;</span>}
                </span>
              )
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </>
  );
}

RotatingText.displayName = "RotatingText";
export default RotatingText;
