"""
꿈 꾸는 45도 — YouTube Shorts 자동 업로드 스크립트
Usage: python scripts/youtube_upload.py [--all | --video 1-10]

첫 실행 시 브라우저가 열려서 Google 로그인을 요청합니다.
한 번 인증하면 토큰이 저장되어 이후에는 자동으로 업로드됩니다.
"""

import os
import sys
import json
import time
import pickle
import httplib2
from pathlib import Path
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# === Config ===
BASE_DIR = Path(__file__).resolve().parent.parent
VIDEOS_DIR = BASE_DIR / 'videos' / 'final'
QUOTES_FILE = BASE_DIR / 'data' / 'quotes.json'
TOKEN_FILE = BASE_DIR / 'scripts' / 'token.pickle'
CLIENT_SECRET_FILE = BASE_DIR / 'scripts' / 'client_secret.json'
SCOPES = ['https://www.googleapis.com/auth/youtube.upload',
          'https://www.googleapis.com/auth/youtube']

# === Video metadata for 10 Shorts ===
SHORTS_META = [
    {
        'file': 'short-01.mp4',
        'title': '모든 위대한 꿈은 당신에서 시작된다 | Every Dream Begins With You',
        'quote_ko': '모든 위대한 꿈은 꿈꾸는 자로부터 시작된다.',
        'quote_en': 'Every great dream begins with a dreamer.',
        'quote_zh': '每一个伟大的梦想，都始于一个敢于做梦的人。',
        'quote_hi': 'हर महान सपने की शुरुआत एक सपने देखने वाले से होती है।',
        'author': '해리엇 터브먼 (Harriet Tubman, 1822–1913)',
        'bio': '미국 노예 해방 운동가. 수백 명의 노예를 자유로 이끈 지하철도의 안내자.',
        'extra_tags': '해리엇터브먼,HarrietTubman,꿈,dream,위대한꿈',
    },
    {
        'file': 'short-02.mp4',
        'title': '당신의 시간은 한정되어 있다 ⏳ | Your Time Is Limited — Steve Jobs',
        'quote_ko': '당신의 시간은 한정되어 있다. 다른 사람의 삶을 사느라 시간을 낭비하지 마라.',
        'quote_en': 'Your time is limited, so don\'t waste it living someone else\'s life.',
        'quote_zh': '你的时间有限，不要浪费在过别人的生活上。',
        'quote_hi': 'आपका समय सीमित है, इसे किसी और की ज़िंदगी जीने में बर्बाद मत करो।',
        'author': '스티브 잡스 (Steve Jobs, 1955–2011)',
        'bio': 'Apple 공동 창립자. 기술과 인문학의 교차점에서 세상을 바꾼 혁신가.',
        'extra_tags': '스티브잡스,SteveJobs,시간,time,Apple',
    },
    {
        'file': 'short-03.mp4',
        'title': '어둠을 저주하기보다 촛불 하나를 켜라 🕯️ | Light a Candle',
        'quote_ko': '어둠을 저주하기보다 촛불 하나를 켜는 것이 낫다.',
        'quote_en': 'It is better to light a candle than curse the darkness.',
        'quote_zh': '与其诅咒黑暗，不如点亮一支蜡烛。',
        'quote_hi': 'अंधेरे को कोसने से बेहतर है एक दीपक जलाना।',
        'author': '엘리너 루스벨트 (Eleanor Roosevelt, 1884–1962)',
        'bio': '미국 제32대 영부인이자 인권 운동가. 세계인권선언의 어머니.',
        'extra_tags': '엘리너루스벨트,EleanorRoosevelt,촛불,희망,hope',
    },
    {
        'file': 'short-04.mp4',
        'title': '일곱 번 넘어져도 여덟 번 일어나라 💪 | 七転び八起き',
        'quote_ko': '일곱 번 넘어지면 여덟 번 일어나라.',
        'quote_en': 'Fall seven times, stand up eight.',
        'quote_zh': '跌倒七次，第八次站起来。',
        'quote_hi': 'सात बार गिरो, आठवीं बार उठो।',
        'author': '七転び八起き (일본 격언)',
        'bio': '일본의 전통 격언. 어떤 역경에도 굴하지 않는 회복 탄력성의 상징.',
        'extra_tags': '일본격언,칠전팔기,도전,challenge,넘어지다',
    },
    {
        'file': 'short-05.mp4',
        'title': '미래는 꿈의 아름다움을 믿는 자의 것 ✨ | The Future Belongs to Dreamers',
        'quote_ko': '미래는 자신의 꿈의 아름다움을 믿는 사람의 것이다.',
        'quote_en': 'The future belongs to those who believe in the beauty of their dreams.',
        'quote_zh': '未来属于那些相信梦想之美的人。',
        'quote_hi': 'भविष्य उनका है जो अपने सपनों की सुंदरता में विश्वास करते हैं।',
        'author': '엘리너 루스벨트 (Eleanor Roosevelt, 1884–1962)',
        'bio': '미국 제32대 영부인이자 인권 운동가.',
        'extra_tags': '미래,future,아름다움,beauty,believe',
    },
    {
        'file': 'short-06.mp4',
        'title': '천 리 길도 한 걸음부터 🚶 | A Journey of a Thousand Miles — 노자',
        'quote_ko': '천 리 길도 한 걸음부터 시작된다.',
        'quote_en': 'A journey of a thousand miles begins with a single step.',
        'quote_zh': '千里之行，始于足下。',
        'quote_hi': 'हज़ार मील की यात्रा एक कदम से शुरू होती है।',
        'author': '노자 (Laozi, BC 6세기)',
        'bio': '중국 도가 철학의 창시자. 도덕경의 저자.',
        'extra_tags': '노자,Laozi,한걸음,journey,도덕경',
    },
    {
        'file': 'short-07.mp4',
        'title': '불가능은 이루어지기 전까지만 불가능하다 🔥 | Nelson Mandela',
        'quote_ko': '불가능해 보이는 것은 이루어지기 전까지만 그렇다.',
        'quote_en': 'It always seems impossible until it\'s done.',
        'quote_zh': '在事情未完成之前，一切看起来都是不可能的。',
        'quote_hi': 'जब तक कुछ किया न जाए, वह असंभव ही लगता है।',
        'author': '넬슨 만델라 (Nelson Mandela, 1918–2013)',
        'bio': '남아프리카공화국 최초 흑인 대통령. 27년 투옥을 견디고 아파르트헤이트를 종식.',
        'extra_tags': '넬슨만델라,NelsonMandela,불가능,impossible,용기',
    },
    {
        'file': 'short-08.mp4',
        'title': '달을 향해 쏴라, 별들 사이에 있게 될 것이다 ⭐ | Shoot for the Moon',
        'quote_ko': '달을 향해 쏴라. 비록 빗나가더라도 별들 사이에 있게 될 것이다.',
        'quote_en': 'Shoot for the moon. Even if you miss, you\'ll land among the stars.',
        'quote_zh': '瞄准月亮射击，即使错过，你也将置身于群星之间。',
        'quote_hi': 'चाँद पर निशाना लगाओ। भले ही चूक जाओ, तारों के बीच पहुँच जाओगे।',
        'author': '레스 브라운 (Les Brown, 1945–)',
        'bio': '미국 동기부여 연설가. 버려진 아이에서 세계적 연설가로.',
        'extra_tags': '레스브라운,LesBrown,달,별,moon,stars',
    },
    {
        'file': 'short-09.mp4',
        'title': '가장 용감한 행동은 스스로 생각하는 것 💎 | Coco Chanel',
        'quote_ko': '가장 용감한 행동은 스스로 생각하는 것이다. 그리고 그것을 소리 내어 말하는 것이다.',
        'quote_en': 'The most courageous act is still to think for yourself. Aloud.',
        'quote_zh': '最勇敢的行为，是独立思考，并大声说出来。',
        'quote_hi': 'सबसे साहसी कार्य है खुद सोचना। और उसे ज़ोर से कहना।',
        'author': '코코 샤넬 (Coco Chanel, 1883–1971)',
        'bio': '프랑스 패션 디자이너. 여성 패션을 해방시킨 혁명가.',
        'extra_tags': '코코샤넬,CocoChanel,용기,courage,자기표현',
    },
    {
        'file': 'short-10.mp4',
        'title': '꿈이 두렵지 않다면, 너무 작은 꿈이다 🌙 | If Your Dream Doesn\'t Scare You',
        'quote_ko': '만약 당신의 꿈이 당신을 두렵게 하지 않는다면, 그것은 충분히 크지 않은 것이다.',
        'quote_en': 'If your dreams don\'t scare you, they are too small.',
        'quote_zh': '如果你的梦想没有吓到你，那说明它还不够大。',
        'quote_hi': 'अगर आपके सपने आपको डराते नहीं हैं, तो वे काफ़ी बड़े नहीं हैं।',
        'author': '엘렌 존슨 설리프 (Ellen Johnson Sirleaf, 1938–)',
        'bio': '라이베리아 대통령. 아프리카 최초 민선 여성 국가원수. 노벨 평화상 수상자.',
        'extra_tags': '엘렌존슨설리프,EllenSirleaf,두려움,fear,큰꿈',
    },
]

# Upload order (optimized for algorithm)
UPLOAD_ORDER = [7, 1, 6, 0, 9, 3, 4, 5, 2, 8]  # 0-indexed: short-08 first

COMMON_TAGS = '꿈꾸는45도,Dream45,명언,오늘의명언,motivation,quotes,inspiration,dailyquotes,인생명언,동기부여,Shorts'

FOOTER = '''──────────────────────
꿈 꾸는 45도 TV | Dreaming 45°
고개를 45도 들어 하늘을 바라보면, 꿈이 시작됩니다.
🌐 https://dream45.vercel.app'''


def get_authenticated_service():
    """Authenticate with YouTube API. Opens browser on first run."""
    credentials = None

    if TOKEN_FILE.exists():
        with open(TOKEN_FILE, 'rb') as token:
            credentials = pickle.load(token)

    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
        else:
            if not CLIENT_SECRET_FILE.exists():
                print('\n' + '=' * 60)
                print('  YouTube API 인증 설정이 필요합니다!')
                print('=' * 60)
                print()
                print('1. https://console.cloud.google.com 접속')
                print('2. 새 프로젝트 생성 (이름: Dream45)')
                print('3. "API 및 서비스" → "라이브러리"')
                print('   → "YouTube Data API v3" 검색 → 사용 설정')
                print('4. "API 및 서비스" → "사용자 인증 정보"')
                print('   → "사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"')
                print('   → 애플리케이션 유형: "데스크톱 앱"')
                print('   → 이름: "Dream45 Uploader"')
                print('5. JSON 다운로드 → 아래 경로에 저장:')
                print(f'   {CLIENT_SECRET_FILE}')
                print()
                print('저장 후 이 스크립트를 다시 실행하세요.')
                print('=' * 60)
                sys.exit(1)

            flow = InstalledAppFlow.from_client_secrets_file(
                str(CLIENT_SECRET_FILE), SCOPES)
            credentials = flow.run_local_server(port=8080)

        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(credentials, token)
        print('✅ 인증 완료! 토큰이 저장되었습니다.')

    return build('youtube', 'v3', credentials=credentials)


def build_description(meta: dict) -> str:
    """Build video description from metadata."""
    return f'''✨ 오늘의 명언

"{meta['quote_ko']}"
— {meta['author']}
{meta['bio']}

🇺🇸 {meta['quote_en']}
🇨🇳 {meta['quote_zh']}
🇮🇳 {meta['quote_hi']}

{FOOTER}

#Shorts #꿈꾸는45도 #Dream45 #명언 #motivation #quotes #inspiration #오늘의명언 #dailyquotes #인생명언'''


def upload_video(youtube, meta: dict, index: int) -> dict:
    """Upload a single video to YouTube."""
    video_path = VIDEOS_DIR / meta['file']

    if not video_path.exists():
        print(f'  ❌ 파일 없음: {video_path}')
        return None

    tags = (COMMON_TAGS + ',' + meta['extra_tags']).split(',')

    body = {
        'snippet': {
            'title': meta['title'],
            'description': build_description(meta),
            'tags': tags,
            'categoryId': '27',  # Education
            'defaultLanguage': 'ko',
        },
        'status': {
            'privacyStatus': 'public',
            'selfDeclaredMadeForKids': False,
            'shorts': {
                'shortsEligibility': 'ELIGIBLE',
            },
        },
    }

    media = MediaFileUpload(
        str(video_path),
        mimetype='video/mp4',
        resumable=True,
        chunksize=1024 * 1024
    )

    request = youtube.videos().insert(
        part='snippet,status',
        body=body,
        media_body=media
    )

    print(f'  ⬆️  업로드 중: {meta["file"]} — {meta["title"][:40]}...')

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            pct = int(status.progress() * 100)
            print(f'     {pct}% 완료', end='\r')

    video_id = response['id']
    print(f'  ✅ 업로드 완료! https://youtube.com/shorts/{video_id}')
    return response


def add_comment(youtube, video_id: str, meta: dict):
    """Add a pinned comment with the full quote."""
    comment_text = f'''🌟 오늘의 명언 전문

"{meta['quote_ko']}"
🇺🇸 "{meta['quote_en']}"

— {meta['author']}

당신의 꿈은 무엇인가요? 댓글로 공유해주세요 ✨
🌐 더 많은 명언: https://dream45.vercel.app'''

    try:
        youtube.commentThreads().insert(
            part='snippet',
            body={
                'snippet': {
                    'videoId': video_id,
                    'topLevelComment': {
                        'snippet': {
                            'textOriginal': comment_text,
                        }
                    }
                }
            }
        ).execute()
        print(f'  💬 고정 댓글 추가 완료')
    except Exception as e:
        print(f'  ⚠️  댓글 추가 실패 (나중에 수동 추가): {e}')


def main():
    import argparse
    parser = argparse.ArgumentParser(description='꿈 꾸는 45도 — YouTube Shorts 자동 업로드')
    parser.add_argument('--all', action='store_true', help='10편 전체 업로드 (최적 순서)')
    parser.add_argument('--video', type=int, help='특정 영상만 업로드 (1-10)')
    parser.add_argument('--delay', type=int, default=30, help='영상 간 대기 시간 (초, 기본 30)')
    parser.add_argument('--list', action='store_true', help='업로드 순서 확인')
    args = parser.parse_args()

    if args.list:
        print('\n📋 최적 업로드 순서:\n')
        for i, idx in enumerate(UPLOAD_ORDER, 1):
            m = SHORTS_META[idx]
            print(f'  {i}. {m["file"]} — {m["title"][:50]}')
        print()
        return

    if not args.all and args.video is None:
        parser.print_help()
        print('\n예시:')
        print('  python scripts/youtube_upload.py --all        # 10편 전체 업로드')
        print('  python scripts/youtube_upload.py --video 8    # short-08만 업로드')
        print('  python scripts/youtube_upload.py --list       # 업로드 순서 확인')
        return

    print('\n🌙 꿈 꾸는 45도 — YouTube Shorts 업로더')
    print('=' * 50)

    youtube = get_authenticated_service()

    if args.video:
        idx = args.video - 1
        if idx < 0 or idx >= len(SHORTS_META):
            print(f'❌ 영상 번호는 1~10 사이여야 합니다.')
            return
        meta = SHORTS_META[idx]
        result = upload_video(youtube, meta, idx)
        if result:
            add_comment(youtube, result['id'], meta)
    elif args.all:
        print(f'\n🚀 10편 전체 업로드 시작! (간격: {args.delay}초)\n')
        uploaded = []
        for i, idx in enumerate(UPLOAD_ORDER, 1):
            meta = SHORTS_META[idx]
            print(f'\n[{i}/10] ─────────────────────────')
            result = upload_video(youtube, meta, idx)
            if result:
                add_comment(youtube, result['id'], meta)
                uploaded.append({
                    'file': meta['file'],
                    'id': result['id'],
                    'url': f'https://youtube.com/shorts/{result["id"]}'
                })

            if i < 10:
                print(f'\n  ⏳ {args.delay}초 대기 중...')
                time.sleep(args.delay)

        print('\n' + '=' * 50)
        print(f'🎉 업로드 완료! ({len(uploaded)}/10편)')
        print('=' * 50)
        for v in uploaded:
            print(f'  {v["file"]}: {v["url"]}')

        # Save upload results
        results_file = BASE_DIR / 'videos' / 'upload-results.json'
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(uploaded, f, ensure_ascii=False, indent=2)
        print(f'\n📄 결과 저장: {results_file}')

    print('\n✨ 꿈 꾸는 45도 — 세상 사람들이 다시 꿈을 꿀 수 있도록\n')


if __name__ == '__main__':
    main()
