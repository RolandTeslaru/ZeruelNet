import React, { ReactNode } from "react";
import styles from "./styles.module.scss"


interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export default function GradientText({
  children,
  className = "",
  colors = ["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"],
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  };

  return (
    <div className={`${styles.animated_gradient_text} ${className}`}>
      {showBorder && (
        <div className={styles.gradient_overlay} style={gradientStyle}></div>
      )}
      <div className={styles.text_content} style={gradientStyle}>
        {children}
      </div>
    </div>
  );
}