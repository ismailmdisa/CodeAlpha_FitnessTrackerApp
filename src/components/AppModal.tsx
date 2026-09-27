import React from 'react';
import { Modal, ModalProps, View, StyleSheet, Platform } from 'react-native';

interface AppModalProps extends ModalProps {
  visible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}

export const AppModal: React.FC<AppModalProps> = ({
  visible,
  children,
  transparent = true,
  animationType = 'slide',
  onRequestClose,
  ...props
}) => {
  if (!visible) return null;

  // On Web: avoid react-native-web portal rendering glitches by rendering a top-level fixed overlay
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.webFixedOverlay,
          transparent ? styles.webTransparent : styles.webOpaque,
        ]}
      >
        {children}
      </View>
    );
  }

  // On iOS / Android: use native Modal
  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onRequestClose}
      {...props}
    >
      {children}
    </Modal>
  );
};

const styles = StyleSheet.create({
  webFixedOverlay: {
    // @ts-ignore
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  webTransparent: {
    backgroundColor: 'transparent',
  },
  webOpaque: {
    backgroundColor: '#0A0A0C',
  },
});
