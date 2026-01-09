import React from 'react';
import ButtonStyles from 'ui-styles/atoms/Button.module.css'
import { Colors } from '../../enums/Colors';
import { useClasses } from '../../hooks/styles.hks';



type Props = {
  onClick?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  title?: string;
  color?: Colors;
}
function Button({ onClick, onPointerDown, onPointerUp, title = 'Button', color }: Props) {
  const mainColor = { '--main-color': `${color || Colors.Primary}` } as React.CSSProperties;
  const [] = useClasses()
  return (
    <button
      className={ButtonStyles.button}
      style={mainColor}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
    <span>{title}</span>
  </button>
  )
}

export default Button;
