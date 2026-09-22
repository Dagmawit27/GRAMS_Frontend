export interface MinioConfig {
  endpoint: string;
  bucket: string;
  useSsl?: boolean;
}

export interface GalleryImage {
  id?: string;
  imageUrl: string;
  label?: string;
  isCover?: boolean;
  uploadedAt?: string;
}

const DEFAULT_FALLBACK_IMAGES: GalleryImage[] = [
  {
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    label: "Main View",
    uploadedAt: new Date().toISOString(),
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    label: "Exterior",
    uploadedAt: new Date().toISOString(),
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    label: "Interior",
    uploadedAt: new Date().toISOString(),
  },
];

export function getMinioConfig(): MinioConfig {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("minio_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore parse error
      }
    }
  }
  return {
    endpoint: process.env.NEXT_PUBLIC_MINIO_ENDPOINT || "http://localhost:9000",
    bucket: process.env.NEXT_PUBLIC_MINIO_BUCKET || "property-images",
  };
}

export function setMinioConfig(endpoint: string, bucket: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("minio_config", JSON.stringify({ endpoint, bucket }));
  }
}

export function resolveMinioImageUrl(
  rawUrl?: string,
  propertyType?: string,
  propertyId?: string,
  index: number = 0
): string {
  if (rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("/"))) {
    return rawUrl;
  }
  const config = getMinioConfig();
  if (rawUrl && rawUrl.trim().length > 0) {
    const cleanKey = rawUrl.replace(/^\/+/, "");
    return `${config.endpoint}/${config.bucket}/${cleanKey}`;
  }
  return DEFAULT_FALLBACK_IMAGES[index % DEFAULT_FALLBACK_IMAGES.length].imageUrl;
}

export function getDynamicPropertyGallery(
  images?: any[],
  propertyType?: string,
  propertyId?: string
): GalleryImage[] {
  if (images && images.length > 0) {
    return images.map((img, idx) => {
      if (typeof img === "string") {
        return {
          id: `img-${idx}`,
          imageUrl: resolveMinioImageUrl(img, propertyType, propertyId, idx),
          label: `Photo ${idx + 1}`,
          isCover: idx === 0,
          uploadedAt: new Date().toISOString(),
        };
      }
      const url = img?.imageUrl || img?.url || "";
      return {
        id: img?.id || `img-${idx}`,
        imageUrl: resolveMinioImageUrl(url, propertyType, propertyId, idx),
        label: img?.label || `Photo ${idx + 1}`,
        isCover: img?.isCover ?? (idx === 0),
        uploadedAt: img?.uploadedAt || new Date().toISOString(),
      };
    });
  }

  return DEFAULT_FALLBACK_IMAGES.map((img, idx) => ({
    ...img,
    id: `default-${idx}`,
    isCover: idx === 0,
    uploadedAt: new Date().toISOString(),
  }));
}
