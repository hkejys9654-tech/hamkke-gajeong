// 가족사진: 휴대폰에서 사진 크기를 줄인 뒤 Firebase(Firestore) hamkkePhotos 컬렉션에 저장합니다.
// 별도 사진 서버 없이 동작하도록, 사진 1장은 1MB 미만의 JPEG 문자열로 보관합니다.
import { useEffect, useState } from "react";
import {
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, FAMILY_COLLECTION } from "./firebase";
import type { FamilyPhoto, FamilyRecord } from "./data";

export const PHOTO_COLLECTION = "hamkkePhotos";
const MAX_SIDE = 1600;
const MAX_DATA_LENGTH = 900_000;

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image-load-failed"));
    };
    image.src = url;
  });
}

async function compress(file: File) {
  const image = await loadImage(file);
  let side = MAX_SIDE;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const scale = Math.min(1, side / Math.max(image.width, image.height));
    const width = Math.round(image.width * scale);
    const height = Math.round(image.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas-unavailable");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    for (const quality of [0.85, 0.75, 0.65]) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length < MAX_DATA_LENGTH) return { dataUrl, width, height };
    }
    side = Math.round(side * 0.75);
  }
  throw new Error("photo-too-large");
}

export function isStoredPhoto(photo?: FamilyPhoto) {
  return Boolean(photo?.storagePath?.startsWith(`${PHOTO_COLLECTION}/`));
}

export async function uploadFamilyPhoto(
  family: FamilyRecord,
  file: File,
  publicityConsent: boolean,
): Promise<FamilyPhoto> {
  if (!family._docId) throw new Error("not-found");
  const { dataUrl, width, height } = await compress(file);
  await setDoc(doc(db, PHOTO_COLLECTION, family._docId), {
    familyNo: family.familyNo,
    dataUrl,
    width,
    height,
    updatedAt: serverTimestamp(),
  });
  const photo: FamilyPhoto = {
    storagePath: `${PHOTO_COLLECTION}/${family._docId}`,
    downloadUrl: "",
    contentType: "image/jpeg",
    size: Math.round((dataUrl.length * 3) / 4),
    internalConsent: true,
    publicityConsent,
    uploadedAt: new Date().toISOString(),
  };
  await updateDoc(doc(db, FAMILY_COLLECTION, family._docId), {
    familyPhoto: photo,
    updatedAt: serverTimestamp(),
  });
  return photo;
}

export async function saveFamilyPhotoConsent(
  family: FamilyRecord,
  publicityConsent: boolean,
): Promise<FamilyPhoto> {
  if (!family._docId || !family.familyPhoto) throw new Error("not-found");
  await updateDoc(doc(db, FAMILY_COLLECTION, family._docId), {
    "familyPhoto.publicityConsent": publicityConsent,
    updatedAt: serverTimestamp(),
  });
  return { ...family.familyPhoto, publicityConsent };
}

export async function removeFamilyPhoto(family: FamilyRecord) {
  if (!family._docId) throw new Error("not-found");
  if (isStoredPhoto(family.familyPhoto)) {
    await deleteDoc(doc(db, PHOTO_COLLECTION, family._docId));
  }
  await updateDoc(doc(db, FAMILY_COLLECTION, family._docId), {
    familyPhoto: deleteField(),
    updatedAt: serverTimestamp(),
  });
}

// 화면에 보여줄 사진 주소를 불러옵니다. 이전 서버(ChatGPT)에 올렸던 사진은 null입니다.
export function useFamilyPhotoUrl(family: FamilyRecord | null) {
  const [url, setUrl] = useState<string | null>(null);
  const docId = family?._docId;
  const stored = isStoredPhoto(family?.familyPhoto);
  const stamp = family?.familyPhoto?.uploadedAt;
  useEffect(() => {
    let alive = true;
    if (!docId || !stored) {
      setUrl(null);
      return;
    }
    getDoc(doc(db, PHOTO_COLLECTION, docId))
      .then((snapshot) => {
        if (alive) setUrl((snapshot.data()?.dataUrl as string) || null);
      })
      .catch(() => alive && setUrl(null));
    return () => {
      alive = false;
    };
  }, [docId, stored, stamp]);
  return url;
}
