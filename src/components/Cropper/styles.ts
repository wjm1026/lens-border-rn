import {StyleSheet} from 'react-native';

import {
  CROP_CORNER_LENGTH,
  CROP_CORNER_THICKNESS,
  CROP_HANDLE_SIZE,
} from '../../config';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  corner: {
    position: 'absolute',
    width: CROP_CORNER_LENGTH,
    height: CROP_CORNER_LENGTH,
  },
  cornerTL: {
    top: -1,
    left: -1,
    borderTopWidth: CROP_CORNER_THICKNESS,
    borderLeftWidth: CROP_CORNER_THICKNESS,
    borderColor: 'white',
  },
  cornerTR: {
    top: -1,
    right: -1,
    borderTopWidth: CROP_CORNER_THICKNESS,
    borderRightWidth: CROP_CORNER_THICKNESS,
    borderColor: 'white',
  },
  cornerBL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: CROP_CORNER_THICKNESS,
    borderLeftWidth: CROP_CORNER_THICKNESS,
    borderColor: 'white',
  },
  cornerBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: CROP_CORNER_THICKNESS,
    borderRightWidth: CROP_CORNER_THICKNESS,
    borderColor: 'white',
  },
  gridVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  gridVerticalThird: {
    left: '33.33%',
  },
  gridVerticalTwoThird: {
    left: '66.66%',
  },
  gridHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  gridHorizontalThird: {
    top: '33.33%',
  },
  gridHorizontalTwoThird: {
    top: '66.66%',
  },
  handleContainer: {
    position: 'absolute',
    width: CROP_HANDLE_SIZE,
    height: CROP_HANDLE_SIZE,
    zIndex: 100,
  },
});
