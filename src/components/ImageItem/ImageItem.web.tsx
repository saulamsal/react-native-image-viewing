import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
} from "react-native";

import useImageDimensions from "../../hooks/useImageDimensions";
import { getImageStyles, getImageTransform } from "../../utils";
import { ImageSource } from "../../@types";
import { ImageLoading } from "./ImageLoading";

const SCREEN = Dimensions.get("window");
const SCREEN_WIDTH = SCREEN.width;
const SCREEN_HEIGHT = SCREEN.height;

type Props = {
  imageSrc: ImageSource;
  onRequestClose: () => void;
  onZoom: (isZoomed: boolean) => void;
  onLongPress: (image: ImageSource) => void;
  delayLongPress: number;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
};

const ImageItem = ({
  imageSrc,
  onZoom,
  onRequestClose,
  onLongPress,
  delayLongPress,
  doubleTapToZoomEnabled = true,
}: Props) => {
  const containerRef = useRef<View>(null);
  const [isLoaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const imageDimensions = useImageDimensions(imageSrc);
  const [translate] = getImageTransform(imageDimensions, SCREEN);

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!doubleTapToZoomEnabled) return;

      const newScale = scale === 1 ? 2 : 1;
      setScale(newScale);
      onZoom(newScale > 1);
    },
    [scale, doubleTapToZoomEnabled]
  );

  const onLongPressHandler = useCallback(() => {
    onLongPress(imageSrc);
  }, [imageSrc, onLongPress]);

  const imageOpacity = new Animated.Value(1);
  const scaleValue = new Animated.Value(scale);
  const translateValue = new Animated.ValueXY(translate);

  const imageStyles = getImageStyles(imageDimensions, translateValue, scaleValue);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onLongPress={onLongPressHandler}
        delayLongPress={delayLongPress}
      >
        <View
          ref={containerRef}
          style={styles.imageContainer}
          onClick={handleDoubleClick}
        >
          {(!isLoaded || !imageDimensions) && <ImageLoading />}
          <Animated.Image
            source={imageSrc}
            style={[styles.image]}
            onLoad={() => setLoaded(true)}
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});

export default React.memo(ImageItem); 