import { Radius, Spacing } from '@/constants/theme';
import React, { useEffect, useRef, ReactNode } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  PanResponder,
  DimensionValue,
  Keyboard,
} from 'react-native';

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  height?: string | number; 
  showHandle?: boolean; // Default: true
  enableSwipeToDismiss?: boolean; // Default: true
  swipeThreshold?: number; // Default: 150
}

export function BottomSheetModal({
  visible,
  onClose,
  children,
  height = '90%',
  showHandle = true,
  enableSwipeToDismiss = true,
  swipeThreshold = 150,
}: BottomSheetModalProps) {
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  // Animate modal open/close
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 1000,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Reset drag position
      dragY.setValue(0);
    }
  }, [visible, slideAnim, dragY]);

  // Listen to keyboard events and reset modal position when keyboard dismisses
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Reset drag position when keyboard is dismissed
      Animated.spring(dragY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [dragY]);

  // Pan Responder for swipe down gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enableSwipeToDismiss,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only activate on swipe down
        return enableSwipeToDismiss && gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging down (not up)
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > swipeThreshold) {
          // Swipe far enough, close modal
          Animated.timing(dragY, {
            toValue: 1000,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          // Not far enough, spring back to original position
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible={visible} animationType="none" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                maxHeight: height as DimensionValue,
                transform: [{ translateY: Animated.add(slideAnim, dragY) }],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()} style={styles.contentWrapper}>
              {/* Swipeable Handle Area */}
              {showHandle && (
                <View {...panResponder.panHandlers} style={styles.handleArea}>
                  <View style={styles.modalHandle} />
                </View>
              )}

              {/* Modal Content */}
              {children}
            </Pressable>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    width: '100%',
    overflow: 'hidden',
  },
  contentWrapper: {
    maxHeight: '100%',
    flexDirection: 'column',
  },
  handleArea: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
});
