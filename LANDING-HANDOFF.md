# 랜딩 페이지 후속 작업 지시서 (새 세션용)

> 이 문서는 클라우드 세션에서 만든 시네마틱 랜딩을,
> **ima2(이미지 생성)와 Grok(영상 생성)이 연결된 로컬 세션**에서 이어받아
> 마무리하기 위한 지시서다. 브랜치: `claude/landing-page-design-i03ffu`

## 0. 전제 조건 확인

1. 이 리포를 클론/체크아웃: `git checkout claude/landing-page-design-i03ffu`
2. ima2 연결 확인 — `D:\TRPG\국경의모험가들` 폴더의 Codex/MCP 설정에 있음.
   Claude Code라면 `claude mcp add`로 동일 서버를 등록하거나, 해당 폴더에서 세션을 시작.
3. 미리보기: 리포 루트에서 `python3 -m http.server` → `http://localhost:8000`

## 1. 현재 상태 (완료된 것)

- `index.html` + `assets/landing.css` + `assets/landing.js`:
  스크롤 고정 스테이지 1개로 히어로 → 전경 분리+내러티브 A(1부, Lv.3)
  → 파노라마 전환 → 내러티브 B(2부 크로스로드, Lv.5) → 가로 카탈로그(문서 6종).
  타임라인 수치는 `landing.js`의 `BEAT` 객체. reduced-motion/no-JS 폴백 있음.
- 임시 아트: 기존 v2 커버/왈든 파노라마 + 수제 SVG 소나무(`assets/landing/fg-pines.svg`)
  + 기존 아트에서 뽑은 카드 webp 6장.
- 데스크톱 8개 스크롤 체크포인트 + 모바일 검증 완료.

## 2. 해야 할 일 A — ima2로 레이어 아트 교체

스타일 기준: `assets/images/cover-arrowkeep-v2.jpg` (보라/마젠타 밤하늘,
골드 촛불 포인트, 굵은 외곽선의 챠비 동화풍). 모든 프롬프트에 스타일 참조로 사용.

| # | 대상 파일(같은 이름으로 저장하면 코드 수정 불필요) | 규격 | 프롬프트 (영문 권장) |
|---|---|---|---|
| 1 | `assets/images/cover-arrowkeep-v2.jpg` 대체 또는 `assets/landing/hero-keep.jpg`* | 2400×1350 16:9 | Full establishing shot: arrow-shaped dark stone fortress "Arrowkeep" with candle-lit windows on a rocky cliff at center-right, candlelit stone stair path, pine forests and moonlit river valley below, large pink crescent moon upper left among swirling violet clouds, one shooting star. Keep lower-left third calm for overlay text. No text, no characters. |
| 2 | `assets/landing/panorama-walden.webp` 대체(크로스로드 버전 권장) | 1920×1080 | Panoramic view of a river-crossing harbor town "Crossroads" where waterways and roads meet: stilt houses, floating market, warm window lights, dusk violet sky. Same chibi storybook style. No text. |
| 3 | `assets/landing/fg-pines.png` (신규, 투명) | 1440×2160, 좌측 클러스터, **하단·좌측은 완전히 솔리드** | Foreground occluder: cluster of very dark silhouetted chunky pine trees and mossy rocks hugging the left edge and bottom, near-black deep purple with subtle pink moonlit rim light, few gold fireflies, transparent background elsewhere. |
| 4 | `assets/landing/card-crossroads.webp` 대체 | 760×428 | Crossroads harbor town gate seen from the road, chibi storybook style (기존 카드는 실사풍이라 톤이 튐). |
| 5 | `assets/landing/card-logs.webp` 대체 | 760×428 | Cozy tavern interior, adventurers sharing stories over a session journal, chibi storybook style. |

\* 새 파일명을 쓰면 `assets/landing.css`의 `.plate-keep`/`.plate-pano` URL과
`index.html` 카드 경로를 같이 수정.

3번(투명 PNG)을 넣을 때는 CSS에서 `.fg img`가 `object-fit: cover`이므로
비율이 다르면 `object-position: left bottom` 유지 확인.
오른쪽은 CSS가 `scaleX(-1)`로 미러링하므로 좌측 기준 하나만 만들면 된다.

참고: 이전 세션에서 Magnific 경유 GPT 2로 생성한 유사 레이어 5장(히어로 합성컷,
하늘 플레이트, 중경 계곡 마을, 성채 단독, 전경 나무 프레임)이 사용자 Magnific
갤러리에 남아 있음. 마음에 들면 내려받아 위 파일명으로 써도 된다.

## 3. 해야 할 일 B — Grok 루프 영상 (선택)

- 목적: 히어로 배경에 생동감. **스크롤 타임라인 대체가 아니라 앰비언트 레이어.**
- 스펙: 16:9, 720p+, 10–15초, 무한루프(시작·끝 구도 동일), mp4(h264) + 가능하면 webm.
- 프롬프트: Static locked-off camera. Seamless ambient loop of the night-sky
  castle illustration: clouds drift slowly left, stars twinkle, moon glow pulses,
  one shooting star. Style/composition identical to start frame; clouds return
  to start position by the final second. No new objects, no text.
- 통합: `index.html`의 `.plate-keep` 바로 앞에
  `<video class="plate plate-video" autoplay muted loop playsinline poster="...">`
  추가, CSS는 `.plate-keep`과 동일 transform 변수 사용 + `prefers-reduced-motion`
  및 `(max-width: 640px)`에서는 `display:none` (포스터 이미지로 대체).
- 저장: `assets/landing/hero-loop.mp4` (5MB 이하 목표).

## 4. 검증 (필수)

1. `python3 -m http.server` 후 데스크톱 1440×900에서
   p = 0 / 0.18 / 0.27 / 0.44 / 0.58 / 0.74 / 0.9 / 1.0 스크롤 체크포인트 확인
   (스크롤량 = 섹션 top + `--travel` × p). 구멍·잘림·텍스트 충돌 없어야 함.
2. 역방향 스크롤 시 모든 상태가 깨끗하게 되돌아가는지.
3. 모바일 390×844, 그리고 OS 모션 축소 모드에서 정적 적층 폴백 확인.
4. 콘솔 에러 0 (Google Fonts 차단 환경 제외).

## 5. 마무리

- 같은 브랜치 `claude/landing-page-design-i03ffu`에 커밋, `git push -u origin`.
- 커밋 메시지 예: `landing: ima2 레이어 아트 적용` / `landing: 히어로 루프 영상 추가`
- PR은 사용자가 요청할 때만 생성.
