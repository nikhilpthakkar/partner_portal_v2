import Image, { type ImageProps } from 'next/image';

type AppImageProps = ImageProps;

const isNativeImgSrc = (src: ImageProps['src']): src is string => {
  if (typeof src !== 'string') {
    return false;
  }

  if (src.includes('/api/partner-logo')) {
    return true;
  }

  return !/^https?:\/\//i.test(src) && /\.svg(?:[?#]|$)/i.test(src);
};

export function AppImage({
  src,
  alt = 'image',
  unoptimized,
  className,
  style,
  ...rest
}: AppImageProps) {
  const isRemote = typeof src === 'string' && /^https?:\/\//i.test(src);

  if (isNativeImgSrc(src)) {
    const { width, height, onError, onLoad } = rest;

    return (
      // Remote/SVG partner logos must bypass next/image so CloudFront signed SVGs render inline.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        className={className}
        style={{ objectFit: 'contain', ...style }}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={onError}
        onLoad={onLoad}
      />
    );
  }

  return (
    <Image
      {...rest}
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      unoptimized={unoptimized ?? isRemote}
    />
  );
}
