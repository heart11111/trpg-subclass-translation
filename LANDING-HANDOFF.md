# 화살성채 랜딩 리뉴얼 — 작업 지시서

> **이 문서 하나만 읽으면 바로 착수할 수 있다.**
> **이 작업은 전부 사용자 PC 로컬 환경에서 실행한다** — 클라우드/웹 세션이 아니라
> ima2(이미지 생성)와 Grok(영상 생성)이 연결된 **로컬 세션** 기준이다.
> 필요한 모든 컨텍스트·금지사항·에셋 명세·구현 스펙 전문이 아래에 있다.

## 0. 로컬 환경 전제 (가장 먼저 확인)

1. 작업 머신: 사용자 Windows PC. **`D:\TRPG\국경의모험가들` 폴더를 먼저 열어
   내용물을 파악할 것** — ima2(Codex/MCP) 연결 설정과 캠페인 참고 자료·이미지가
   여기에 있다. 랜딩 아트 디렉션을 잡을 때 이 폴더의 자료를 우선 참고한다.
2. 리포의 로컬 클론 위치를 확인하고(없으면
   `git clone https://github.com/heart11111/trpg-subclass-translation` 후)
   `git checkout claude/landing-page-design-i03ffu`. 원격 작업 아님 —
   생성한 이미지·영상 파일은 로컬 디스크에 바로 저장해 리포에 넣는다.
3. ima2/Grok 호출이 실제로 되는지 소형 테스트 생성 1회로 확인하고 나서 본 작업 시작.
4. 로컬 미리보기(Windows): 리포 루트에서 `py -m http.server` 또는
   `python -m http.server` → `http://localhost:8000`

---

## 1. 미션 (사용자 원 지시)

1. 사이트 **랜딩 페이지(index.html) 디자인을 새로 만든다.**
2. 랜딩에 필요한 **이미지는 전부 ima2로 신규 생성**한다.
3. 가능하면 **Grok으로 루프 영상**(앰비언트, 반복 재생)을 만들어 히어로에 쓴다.
4. §7의 **스크롤 시네마틱 마이크로사이트 스펙**의 느낌을 버무린다
   (스크롤로 하나의 세계를 카메라처럼 통과하는 2.5D 씬).

## 2. 프로젝트 컨텍스트

- 리포: `https://github.com/heart11111/trpg-subclass-translation`
- 배포: GitHub Pages → `https://heart11111.github.io/trpg-subclass-translation/`
- **작업 브랜치: `claude/landing-page-design-i03ffu`** — 여기에만 커밋/푸시.
  PR은 사용자가 요청할 때만 생성.
- 스택: 순수 HTML/CSS/JS 정적 사이트, 빌드 없음 (미리보기는 §0-4).
- 내용: D&D 5e 캠페인 자료집. 1부 "화살성채"(Lv.3 시작), 2부 "크로스로드"(Lv.5 시작).
- ima2 연결: §0-1 참조 (`D:\TRPG\국경의모험가들`). 해당 폴더에서 세션을 열거나
  같은 서버를 MCP로 등록해 사용. **이미지·영상 생성과 파일 저장 모두 로컬에서 수행.**

## 3. 금지 사항 — 반드시 지킬 것 (오인 방지)

- **기존 아트 재사용 금지.** `assets/images/`의 보라색 챠비풍 이미지 전부
  (cover-arrowkeep*, guide-*, world-map*, setting-guild*, homebrew-tome*,
  backgrounds-v2, races-v2, subclasses-v2 등)와 `assets/crossroads/`의 실사풍
  이미지를 **랜딩에 쓰지 않는다.** 사용자가 명시적으로 거부했다.
  랜딩 비주얼은 100% ima2 신규 생성.
- **이전 랜딩 레이아웃 재사용 금지.** 구버전 랜딩(정적 히어로+번호 목록)과
  git 히스토리에 있는 폐기된 시네마틱 시안(커밋 `a55a138`, 기존 아트 재활용본)
  모두 사용자 불승인. 그 구도·아트·비주얼을 가져오지 말 것.
  (단, 해당 커밋의 **스크롤 엔진 JS 로직**을 코드 참고용으로 보는 것은 허용.)
- **Magnific 등 외부 이미지 생성 서비스 사용 금지.** 이미지는 ima2, 영상은 Grok.
- 현재 `index.html`은 임시 텍스트 허브다. 자유롭게 덮어쓴다.
- 랜딩 외의 문서 페이지들(player-guide 등)은 건드리지 않는다.

## 4. 콘텐츠 실데이터 (카피에 그대로 사용)

- 사이트명: **화살성채** / 아이브로우: `ARROWKEEP CAMPAIGN ARCHIVE`
- 소개문(lede): "카이엔 동부 국경지대 캠페인을 위한 플레이어용 자료집입니다.
  시작 안내, 세계관, 설정 메모, 홈브류 규칙을 세션 중 바로 찾을 수 있게 묶었습니다."
- 캠페인 팩트: 시스템 D&D 5e · 1부 화살성채 Lv.3 시작 · 2부 크로스로드 Lv.5 시작
  · 무대 카이엔 동부 국경지대
- 내러티브 비트 제안:
  - A(1부): "국경의 모험가들" — 카이엔 동부 화살성채, 국경 너머의 위협과
    마주하는 모험가 길드. CTA → `player-guide.html`
  - B(2부): "크로스로드" — 물길과 뭍길이 교차하는 도시, Lv.5 새 여정.
    CTA → `crossroads-guide.html`
- 최종 카탈로그(가로 카드 레일) 6종:

| # | 링크 | 제목 | 설명 |
|---|---|---|---|
| 01 | `player-guide.html` | 플레이어 가이드 | 시작점, 캐릭터 메이킹, 세션 규칙 |
| 02 | `world.html` | 세계관 자료 | 세력, 국가, 종족 인식, 판테온 |
| 03 | `setting.html` | 설정 정리 | 카이엔 동부 국경지대와 주요 사건 |
| 04 | `homebrew.html` | 룰/홈브류 | 클래스, 서브클래스, 피트, 주문 |
| 05 | `crossroads-guide.html` | 크로스로드 가이드 | 2부 무대, Lv.5 캐릭터 메이킹 |
| 06 | `logs/index.html` | RP 로그 | 지난 세션 채팅 로그 아카이브 |

- 상단 내비게이션: 위 6종 + `credits.html` (크레딧)

## 5. 에셋 생성 (ima2) — 레이어 계약

**아트 디렉션은 새로 잡는다** (기존 보라 챠비풍 모방 금지).
`D:\TRPG\국경의모험가들` 폴더에 사용자가 모아둔 참고 이미지·자료가 있으면
그 톤을 우선 반영한다. 없으면 착수 전에 사용자에게 방향 1회 컨펌 권장 —
예: ① 회화적 다크 판타지(유화 텍스처, 촛불 골드), ② 잉크+수채 지도풍,
③ 픽셀/도트 레트로. 컨펌 불가 시 ①로 진행.
모든 레이어는 **같은 카메라·원근·광원·색보정·마스터 비율(16:9)** 을 공유해야 하며,
모션에 노출될 가장자리는 10–20% 블리드를 포함한다. 텍스트 금지, 알파는 헤일로 없이.

| 역할 | 파일 | 규격 | 내용 (프롬프트 뼈대 — 확정한 아트 디렉션 문구를 덧붙여 사용) |
|---|---|---|---|
| 00 하늘 플레이트 | `assets/landing/00-sky.webp` | 2560×1440 불투명 | Night sky only, no ground/horizon: layered clouds, crescent moon upper left, stars, one shooting star. Full-bleed background plate for a layered parallax scene. No text. |
| 10 원경 | `assets/landing/10-ridge.png` | 2560×1440 투명 상단 | Distant border-mountain ridgeline with tiny pines, silhouette band occupying bottom 40%, transparent above, moonlit rim light. Same horizon as other layers. |
| 20 중경 | `assets/landing/20-valley.png` | 2560×1440 투명 상단 | Midground river valley of the eastern Kaien borderlands: forested hills, winding moonlit river, small village lights, occupying bottom 55%, transparent above. |
| 30 히어로 | `assets/landing/30-keep.png` | 2048×2048 투명 | Isolated arrow-shaped border fortress "Arrowkeep" on a rocky cliff, candle-lit windows, banners; generous empty canvas margin around for push-in zoom; bottom-anchored. |
| 40 전경 좌 | `assets/landing/40-fg-left.png` | 1440×2160 투명, 좌·하단 솔리드 | Very dark foreground cluster (pines/rocks/gate edge) hugging left edge and bottom, subtle rim light; must be fully solid along left+bottom so nothing shows through. |
| 41 전경 우 | `assets/landing/41-fg-right.png` | 1440×2160 투명, 우·하단 솔리드 | Mirror-composition counterpart of 40 (generate separately for variation). |
| 50 프레임(선택) | `assets/landing/50-frame.png` | 2560×1440 투명 중앙 | Optional portal/arch edge frame (gate stones, hanging banner corners). Empty center. |
| 카드 6장 | `assets/landing/card-01..06.webp` | 각 1520×856 | 표 §4의 각 문서 주제를 같은 아트 디렉션으로. (01 캐릭터 시트와 주사위가 있는 길드 테이블 / 02 국경 지도 / 03 의뢰 게시판 / 04 마법서와 주사위 / 05 크로스로드 항구도시 / 06 선술집의 기록장) |
| 파노라마 | `assets/landing/60-panorama.webp` | 2560×1440 불투명 | Clean panoramic vista for the mid-scroll reveal: the borderlands at dawn 또는 크로스로드 도시 전경 — 히어로 씬과 같은 세계, 다른 시점. |

## 6. Grok 루프 영상 (선택이지만 권장)

- 용도: 히어로 배경 앰비언트. **스크롤 타임라인 대체 금지** (§7 스펙 준수).
- 스펙: 16:9, 720p 이상, 10–15초, **무한루프**(시작=끝 구도), mp4(h264) ≤5MB.
  파일: `assets/landing/hero-loop.mp4`, 포스터는 00-sky.webp.
- 프롬프트: Static locked-off camera. Seamless ambient loop of the night sky
  plate: clouds drift slowly, stars twinkle, moon glow gently pulses, one
  shooting star; composition/style identical to the start frame; clouds return
  to their starting position by the final second. No new objects, no text.
- 통합: 00 플레이트 자리에 `<video autoplay muted loop playsinline poster=…>`.
  `prefers-reduced-motion` 및 모바일(≤640px)에서는 영상 대신 00-sky.webp.

## 7. 구현 스펙 (전문 — 이 느낌으로 구현할 것)

PROJECT INPUTS는 다음으로 채운다:

- Project name: Arrowkeep Landing (화살성채 캠페인 자료집 랜딩)
- Subject: D&D 5e 캠페인 "화살성채" — 카이엔 동부 국경지대의 요새와 모험가 길드
- Primary message: 세션 중 바로 꺼내 쓰는 캠페인 자료집 — 1부 화살성채, 2부 크로스로드
- Audience: 캠페인 참여 플레이어 (데스크톱+모바일)
- Visual direction: §5에서 확정한 새 아트 디렉션 (기존 아트 모방 금지)
- Required narrative beats: §4의 A(1부), B(2부)
- Final interaction/CTA: §4의 6종 문서 카드 가로 레일
- Asset directory: `assets/landing/` (§5 명명 규칙)
- Preferred implementation: 순수(vanilla) HTML/CSS/JS, 프레임워크·라이브러리 금지

이하 스펙 원문:

```
You are a senior creative frontend engineer and motion systems designer.
Build a production-quality scroll-driven cinematic microsite from the supplied
brief, copy, visual references, and layered image assets.

CORE EXPERIENCE
Create one continuous 2.5D cinematic scene controlled by vertical scrolling.
Do not build a conventional stack of unrelated full-screen sections. Do not use
a prerecorded video as the visual timeline. Use one long scroll container and
one pinned or sticky viewport-height stage. Compose aligned depth layers inside
the stage and map scroll progress to transforms, opacity, blur, brightness,
saturation, masks, and narrative text.

The experience should feel like a camera moving through one coherent world:
1. Establishing hero composition.
2. Slow push-in while the opening title and copy leave.
3. A foreground object opens, separates, or moves around the viewer.
4. A focused narrative panel appears inside the newly revealed negative space.
5. The foreground exits and reveals a clean panoramic scene.
6. A second narrative beat appears over a subtly blurred or tinted background.
7. The world returns to focus.
8. A horizontal catalog / card rail enters over the same scene.
9. The final state remains interactive.

FIRST: INSPECT, THEN IMPLEMENT
- Inspect the repository stack, scripts, conventions, and existing user changes.
- Inspect every supplied image: dimensions, alpha, bounding box, intended depth,
  anchor point, and role (background plate / midground / hero / occluder / frame).
- Reuse the existing stack; do not add frameworks or animation libraries.
- Preserve unrelated work. If an asset is missing, create a clearly named
  placeholder layer, continue, and list it in the final handoff.

ART DIRECTION
- Large editorial composition, calm pacing, restrained typography, one dominant
  visual idea. Minimal navigation and copy.
- Refined display serif for major headlines, readable sans serif for UI text.
- All text/nav/buttons/cards as semantic HTML; never bake UI or copy into images.
- No generic gradient-heavy startup aesthetics, excessive glassmorphism, neon
  glow, random floating objects, or motion that does not reinforce depth.
- Explicit design tokens for ink, paper, background, tint, spacing, radii,
  shadows, and type scale.

ASSET CONTRACT (roles 00/10/20/30/40/41/50 + overlays)
- All layers share one camera, perspective, light direction, color grade, and
  master aspect ratio; 10–20% bleed where motion may expose an edge; clean
  straight alpha without halos; stable bottom/center anchors; no text;
  web-optimized; width/height attributes or aspect-ratio reservation.
- Fix small misalignments in CSS; report assets that truly need recompositing.

PAGE ARCHITECTURE
main > section.cinematic-scroll > div.cinematic-stage
  > div.world (background layers, midground group, hero+foreground, tint)
  + intro copy + narrative panel A + narrative panel B + final catalog.
- Virtual timeline typically 3,600–5,000 CSS px on desktop.
- Stage: position sticky; top 0; 100svh/100dvh with fallback; overflow clip;
  isolation isolate.
- Documented z-index bands: 0–9 world, 10–19 tint, 20–29 copy, 30–39 nav, 40+.

SCROLL ENGINE
- Local scroll distance from the cinematic section, clamped; normalized p 0..1.
- Scene boundaries in one readable configuration object; helpers clamp/lerp/
  smoothstep/rangeProgress/segmentInOut.
- requestAnimationFrame rendering; listeners only request frames; passive where
  possible; smoothed visual playhead (disabled under reduced motion); pointer
  input smoothed separately; stop frames once converged.
- Write a small set of CSS custom properties; CSS owns final transforms.
- transform/opacity for most motion; no synchronous layout in the frame loop;
  cache geometry, recompute on resize/asset load.

Suggested normalized timeline (tune, don't treat as magic numbers):
0.00–0.03 hero hold · 0.03–0.18 title/intro exit · 0.15–0.25 foreground split
and push-in · 0.25–0.35 narrative A hold · 0.35–0.44 A/foreground exit ·
0.44–0.48 clean panorama hold · 0.48–0.58 narrative B enter · 0.58–0.69 B hold
· 0.69–0.74 B exit, refocus · 0.75–0.96 catalog enters horizontally ·
0.91–1.00 controls appear, final settle.

DEPTH AND MOTION RULES
- Background motion smallest, midground slightly larger, hero/foreground
  largest. Pointer parallax subtle (6–24px), opposing directions far vs near.
- Deliberate transform-origin per layer; never expose an empty canvas edge.
- Blur only for focus transitions, minimum needed for legibility, with cheap
  tint/opacity fallback for low-power devices. Composition must not drift.

NARRATIVE TEXT
- Each panel: clear headline, concise body, optional facts/CTA.
- Animate text independently; opacity + small translation only.
- Sufficient contrast; controlled line lengths; fluid type via clamp().
- No simultaneous panels unless intentional.

FINAL CATALOG
- Horizontal card rail: prev/next controls, mouse + touch drag + keyboard,
  visible focus states, semantic links; if infinite looping, hide the seam,
  aria-hidden clones out of tab order; announce position accessibly; no fake
  clickability; compensate scale if the rail lives inside a scaled group.

RESPONSIVE (test 1440×900, 1280×720, 1024×768, 768×1024, 390×844)
- svh/dvh-aware sizing, safe-area padding; preserve the main subject; smaller
  headlines; reduce/disable pointer motion for coarse pointers; shorten travel
  if exhausting; cards swipeable; no horizontal overflow; nav never covers copy.

ACCESSIBILITY AND MOTION SAFETY
- Semantic landmarks/headings/buttons/lists; empty alt for decorative images.
- All controls keyboard reachable with visible focus.
- Genuine prefers-reduced-motion mode: no inertial smoothing or parallax, no
  aggressive zoom/blur/lateral travel; static hero + normal-flow content with
  everything available. Contrast OK at 200% zoom. Never trap scrolling.

LOADING AND PERFORMANCE
- Preload only critical hero layers + above-the-fold font; readiness barrier
  (image.decode) before revealing the stage; lazy-load late-timeline assets;
  WebP/AVIF for large layers, PNG only where alpha demands; no 4K masters to
  every device; no layout shifts; clean console; don't animate offscreen.

INTERACTION INTEGRITY
- Every nav link targets a real section/timeline marker (computed scroll,
  reduced-motion-safe). Every visible button works. No placeholder labels,
  dead controls, or fake switchers in the finished version.

IMPLEMENTATION QUALITY
- Small descriptive modules; timeline constants / selectors / state /
  measurement / render calc / event wiring separated; comment non-obvious
  coordinate compensation; data-driven scene configuration; content editable
  without touching animation math; no GSAP/Lenis/Three.js.

QA CHECKPOINTS — inspect p = 0.00 / 0.18 / 0.27 / 0.44 / 0.58 / 0.74 / 0.90 /
1.00: no holes or unpainted edges, no layer-order accidents, no text
collisions, no opacity pops, no stretching, no critical cropping, no loading
flashes, no horizontal overflow. Test both scroll directions — the timeline
must be fully reversible and deterministic.

DELIVERABLES
1. Working source. 2. Short README with run command. 3. Asset manifest (role,
dimensions, anchor, depth per layer). 4. Timeline map. 5. Remaining-work notes.
6. Verification results (desktop/tablet/mobile/keyboard/reduced-motion/console).

DEFINITION OF DONE
Polished editorial first screen; scrolling feels like camera choreography
through one world; every beat has enter/hold/exit; reversing scroll is clean;
catalog genuinely usable; mobile & reduced-motion preserve all content; assets
load without popping; no dead controls; smooth on a normal laptop; another
developer can retime or replace art without reverse-engineering.

Do not stop at a rough scaffold. Implement, run it, inspect every checkpoint,
fix visible defects, and provide a concise handoff.
```

## 8. 검증 (필수)

1. 로컬에서 `py -m http.server` 기동 후 §7의 QA 체크포인트 8곳을 실제 브라우저로
   확인(가능하면 스크린샷). 스크롤량 = 섹션 top + travel × p.
2. 역스크롤 복원, 모바일 390×844, reduced-motion 폴백, 콘솔 에러 0 확인.
3. 완료 기준은 §7의 DEFINITION OF DONE.

## 9. 마무리 (git)

- 브랜치 `claude/landing-page-design-i03ffu`에 커밋 (예: `landing: ima2 아트
  시네마틱 랜딩 구현`), `git push -u origin claude/landing-page-design-i03ffu`.
- 이 지시서(LANDING-HANDOFF.md)는 작업 완료 후 결과 요약으로 갱신하거나 삭제.
- PR은 사용자가 요청할 때만.
