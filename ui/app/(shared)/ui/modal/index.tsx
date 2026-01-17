import React, { useState } from 'react';

import clsx from 'clsx';

import { ModalProps } from './model/types';
import styles from './styles.module.scss';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  if (!isOpen) return null;

  return (
    <div
      className={clsx(styles.modalOverlay, { [styles.closing]: isClosing })}
      onClick={handleClose}
    >
      <div
        className={clsx(styles.modal, className, {
          [styles.closing]: isClosing,
        })}
        onClick={e => e.stopPropagation()}
      >
        {showCloseButton && (
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
};
