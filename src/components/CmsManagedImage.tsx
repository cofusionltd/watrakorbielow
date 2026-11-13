import React from 'react';
import { CMS_IMAGE_REMOVED, useCmsImage } from '../context/CmsContext';

type CmsManagedImageProps = React.ImgHTMLAttributes<HTMLImageElement> & { src: string };

export const CmsManagedImage: React.FC<CmsManagedImageProps> = ({ src, ...props }) => {
  const resolvedSource = useCmsImage(src);
  return resolvedSource === CMS_IMAGE_REMOVED ? null : <img src={resolvedSource} {...props} />;
};
