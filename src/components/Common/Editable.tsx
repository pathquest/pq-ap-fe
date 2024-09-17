import React, { RefObject, useEffect, useState } from "react";

interface EditableProps {
  text: string
  type: string
  placeholder?: string
  children: React.ReactNode
  childRef?: RefObject<HTMLInputElement>
  focusNext?: () => void
  onTabPress?: () => void
  borderClassName?: string
}

// Component accept text, placeholder values and also pass what type of Input - input, textarea so that we can use it for styling accordingly
const Editable = ({
  text,
  type,
  placeholder,
  children,
  childRef,
  focusNext,
  onTabPress,
  borderClassName,
  ...props
}: EditableProps) => {
  const [isEditing, setEditing] = useState(false);

  useEffect(() => {
    if (childRef && childRef.current && isEditing === true) {
      childRef.current.focus();
    }
  }, [isEditing, childRef]);

  const handleKeyDown = (event: React.KeyboardEvent, type: string) => {
    const { key, shiftKey } = event;
    const keys = ["Escape", "Tab"];
    const enterKey = "Enter";
    const allKeys = [...keys, enterKey]; // All keys array

    if (
      (type === "text" && keys.indexOf(key) > -1) ||
      (type !== "text" && allKeys.indexOf(key) > -1)
    ) {
      setEditing(false);

      if (key === "Tab") {
        event.preventDefault();
        if (shiftKey) {
          // Handle Shift+Tab
          (event.target as HTMLElement).blur();
          setEditing(false);
        } else if (onTabPress) {
          onTabPress();
        }
      } else {
        setEditing(false);
      }
    }
  };

  const handleInitialKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditing(true);
    } else if (e.key === "Tab") {
      setEditing(false);
    } else if (/^[a-zA-Z0-9]$/.test(e.key)) {
      // If the key is an alphanumeric character
      setEditing(true);
    }
  };

  return (
    <section {...props} className={borderClassName} >
      {isEditing ? (
        <div
          onBlur={() => setEditing(false)}
          onKeyDown={e => handleKeyDown(e, type)}
        >
          {children}
        </div>
      ) : (
        <div
          className="outline-none focus:border-b focus:mb-[-1px] focus:border-primary"
          onClick={() => setEditing(true)}
          tabIndex={0}
          onKeyDown={handleInitialKeyDown}
        >
          <span className="break-all">
            {text || placeholder || "Enter Content"}
          </span>
        </div>
      )}
    </section>
  );
};

export default Editable;