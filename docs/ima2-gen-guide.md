# IMA2-GEN으로 카드 아트 만들어서 넣기

이 문서는 [ima2-gen](https://github.com/lidge-jun/ima2-gen)을 **로컬 PC**에 설치해서
서브클래스/배경/종족 카드 아트를 생성하고, 그 결과물을 이 저장소(`trpg-subclass-translation`)에
반영하는 절차를 정리한 가이드입니다. ima2-gen은 데스크톱 앱(+CLI)이라 이 저장소 코드에
포함되지 않으며, 사용자 로컬 환경에 설치해서 씁니다.

## 1. ima2-gen 로컬 설치

```bash
npm install -g ima2-gen
ima2 setup     # ChatGPT OAuth 로그인 또는 OPENAI_API_KEY 등록
ima2 serve     # http://localhost:3333 웹 UI 실행
```

CLI로 바로 생성하는 것도 가능합니다.

```bash
ima2 gen "프롬프트 내용" -o out.png
```

인증은 다음 중 하나를 선택합니다.
- **ChatGPT OAuth** (무료, 이미지 생성만)
- **API 키**: `OPENAI_API_KEY` 환경변수 (GPT Image 2 모델 사용)

## 2. 프롬프트 작성 — GPT-Image2-Skill 참고

프롬프트 품질은 [GPT-Image2-Skill](https://github.com/wuyoscar/GPT-Image2-Skill)의
`skills/gpt-image/references/craft.md`(프롬프트 엔지니어링 가이드)와
`gallery-*.md` 카테고리별 예시를 참고해서 작성하세요. Claude Code를 쓰는 경우 스킬을
직접 설치해서 프롬프트 초안을 잡을 수도 있습니다.

```
/plugin marketplace add wuyoscar/gpt_image_2_skill
/plugin install gpt-image@wuyoscar-skills
```

이 저장소는 판타지 TRPG(D&D 5e 홈브류) 카드 아트이므로, 프롬프트에는 보통 다음을 포함합니다.
- 캐릭터/클래스 컨셉 (예: "잿더미의 회합 드루이드, 재로 뒤덮인 갑주")
- 페인팅/일러스트 스타일 (다크 판타지, 유화 느낌의 커미션 일러스트 톤 — `credits.html`에 기존
  일러스트 출처가 정리돼 있으니 톤을 참고)
- 인물 중심 세로 구도, 배경은 단순하게

## 3. 파일 스펙 — 기존 애셋과 맞추기

카드 아트는 위치별로 다음 규격을 씁니다 (`assets/images/` 아래 기존 파일 기준).

| 종류 | 폴더 | 파일명 규칙 | 권장 규격 |
|---|---|---|---|
| 서브클래스 | `assets/images/subclasses-v2/` | `<slug>.jpg` (또는 `.png`/`.webp`) | 세로 4:5, 예: 960×1200 |
| 배경 | `assets/images/backgrounds-v2/` | `<slug>.png` | 세로 4:5, 예: 1120×1400 |
| 종족 | `assets/images/races-v2/` | `<slug>.jpg` | 세로 4:5, 예: 960×1200 |
| 클래스(완전 클래스) | `assets/images/homebrew-classes/` | `<class>.jpg` | 정방형, 예: 418×418 |

`ima2 gen`에서 `--size portrait` 계열 옵션으로 세로 비율을 맞추고, 필요하면 로컬에서
리사이즈/크롭해서 위 규격에 맞추세요.

## 4. 생성한 이미지를 저장소에 연결하기

1. 생성한 이미지를 위 표의 해당 폴더에 저장합니다. 파일명은 `scripts/build-homebrew.js`의
   슬러그(slug)와 맞춰야 합니다. 예: `크라켄 - Kraken` → `kraken` → `assets/images/subclasses-v2/kraken.jpg`.
   기존 슬러그는 `scripts/build-homebrew.js`의 `slugOverrides` 맵에서 확인할 수 있습니다.
2. **새 서브클래스/배경/종족용 아트를 추가**하는 경우, `scripts/build-homebrew.js` 안의
   해당 맵(`subclassArt`, `backgroundArt`, `raceArt`, `classArt`)에 한글 제목(원문 그대로) →
   이미지 경로 항목을 추가합니다.
   **기존 항목의 아트를 새 이미지로 교체**하는 경우엔 맵 수정 없이 같은 경로에 파일만
   덮어쓰면 됩니다 (빌드 스크립트가 파일 해시로 캐시 버스팅을 자동으로 처리합니다).
3. 빌드 스크립트를 실행해 HTML을 재생성합니다.

   ```bash
   node scripts/build-homebrew.js
   ```

4. `git status`로 바뀐 이미지/HTML을 확인하고 커밋·푸시합니다.

## 5. 출처 표기

새 이미지가 AI 생성물이라면 `credits.html`이 참조하는 `source/subclass-translation.md` 등의
제작 정보 섹션(`#### 제작 및 고지`)에 "카드 아트: GPT Image 2 (ima2-gen)" 같은 표기를
남겨서 다른 항목들과 동일한 방식으로 출처를 관리하세요.
