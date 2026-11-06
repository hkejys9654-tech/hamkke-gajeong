# 함께가정 사전·사후 진단

전남광주통합특별시 서구의 「생활 속 양성평등 함께 잇다」 사업용 웹앱입니다.

- 참여 가정: https://hkejys9654-tech.github.io/hamkke-gajeong/
- 관리자: https://hkejys9654-tech.github.io/hamkke-gajeong/admin/

## 구성

- 화면: Vite + React, GitHub Pages 배포 (`main`에 올리면 자동 배포)
- 데이터: Firebase `seogu-safety-map` 프로젝트의 Firestore
  - `hamkkeFamilies` 가정별 응답
  - `hamkkePhotos` 가족사진(휴대폰에서 줄여 1MB 미만으로 저장)
  - `admins/{uid}` 관리자 구글 계정
- 보안 규칙: `seogu-safety-map` 저장소의 `firestore.rules` 하나로 관리합니다.
  (그 저장소에 올리면 규칙이 자동 배포되므로, 이 저장소에는 규칙 파일을 두지 않습니다.)

## 빠른 수정 위치

- 문구·설문 문항: `app/content.ts`
- 함께카드 100장: `app/cards.json`
- 참여 화면: `app/components/family/`
- 관리자 화면: `app/components/admin/`
- 가족사진 저장: `app/photo.ts`
- 색상·화면 모양: `app/globals.css`

## 실행

```bash
npm install
npm run dev
```
