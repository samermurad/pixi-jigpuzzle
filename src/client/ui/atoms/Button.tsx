import React from 'react';
import ButtonStyles from 'ui-styles/atoms/Button.module.css'
import { Colors } from '../../enums/Colors';
import { useClasses, useClassesStatic } from '../../hooks/styles.hks';



type Props = {
  onClick?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  title?: string;
  color?: Colors;
  className?: string;
}
function Button(props: Props, ref: React.Ref<HTMLButtonElement>) {
  const { onClick, onPointerDown, onPointerUp, title = 'Button', color, className } = props;
  const mainColor = { '--main-color': `${color || Colors.Primary}` } as React.CSSProperties;
  const [classes] = useClassesStatic(ButtonStyles.button, ButtonStyles.shiny, className);
  return (
    <button
      ref={ref}
      className={classes}
      style={mainColor}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
    <span>{title}</span>
  </button>
  )
}

export default React.forwardRef(Button);
