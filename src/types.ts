export type ImageSource = 'upload' | 'icon';

export interface IconLicense {
  title: string;
  spdx?: string;
  url?: string;
}

export interface IconAttribution {
  providerId: string;
  providerLabel: string;
  collectionPrefix: string;
  collectionName: string;
  author?: string;
  authorUrl?: string;
  license?: IconLicense;
}

export interface IconImageData {
  fullName: string;
  prefix: string;
  name: string;
  attribution: IconAttribution;
}

export interface CollectionImage {
  id: string;
  name: string;
  src: string;
  source: ImageSource;
  isObjectUrl: boolean;
  icon?: IconImageData;
}

export interface UploadRejection {
  fileName: string;
  reason: string;
}
