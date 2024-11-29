/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from "react";
import { Image, ImageURISource, Platform } from "react-native";

import { createCache } from "../utils";
import { Dimensions, ImageSource } from "../@types";

const CACHE_SIZE = 50;
const imageDimensionsCache = createCache(CACHE_SIZE);

const getImageSizeWeb = (uri: string): Promise<Dimensions> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = uri;
  });
};

const useImageDimensions = (image: ImageSource): Dimensions | null => {
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  const getImageDimensions = async (image: ImageSource): Promise<Dimensions> => {
    if (typeof image === "number") {
      const cacheKey = `${image}`;
      let imageDimensions = imageDimensionsCache.get(cacheKey);

      if (!imageDimensions) {
        const { width, height } = Image.resolveAssetSource(image);
        imageDimensions = { width, height };
        imageDimensionsCache.set(cacheKey, imageDimensions);
      }

      return imageDimensions;
    }

    if ("uri" in image && image.uri) {
      const source = image as ImageURISource;
      const cacheKey = source.uri;
      const imageDimensions = imageDimensionsCache.get(cacheKey);

      if (imageDimensions) {
        return imageDimensions;
      }

      try {
        if (Platform.OS === "web") {
          const dimensions = await getImageSizeWeb(source.uri);
          imageDimensionsCache.set(cacheKey, dimensions);
          return dimensions;
        } else {
          return new Promise((resolve) => {
            Image.getSizeWithHeaders(
              source.uri,
              source.headers,
              (width: number, height: number) => {
                const dimensions = { width, height };
                imageDimensionsCache.set(cacheKey, dimensions);
                resolve(dimensions);
              },
              () => {
                resolve({ width: 0, height: 0 });
              }
            );
          });
        }
      } catch (error) {
        return { width: 0, height: 0 };
      }
    }

    return { width: 0, height: 0 };
  };

  let isImageUnmounted = false;

  useEffect(() => {
    getImageDimensions(image).then((dimensions) => {
      if (!isImageUnmounted) {
        setDimensions(dimensions);
      }
    });

    return () => {
      isImageUnmounted = true;
    };
  }, [image]);

  return dimensions;
};

export default useImageDimensions;
