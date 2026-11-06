// 이미지 경로: GitHub Pages 하위 주소(/hamkke-gajeong/)에서도 깨지지 않게 합니다.
export const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;
export const appUrl = (path = "") => `${import.meta.env.BASE_URL}${path}`;
