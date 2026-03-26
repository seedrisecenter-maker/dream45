# -*- coding: utf-8 -*-
"""
YouTube Shorts auto-upload via browser automation.
Uses existing Chrome login — no API key needed.
"""

import io
import sys
import os
import time
import json
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

BASE_DIR = Path(__file__).resolve().parent.parent
VIDEOS_DIR = BASE_DIR / 'videos' / 'final'

SHORTS = [
    {
        'file': 'short-08.mp4',
        'title': '달을 향해 쏴라, 별들 사이에 있게 될 것이다 | Shoot for the Moon',
        'description': (
            '오늘의 명언\n\n'
            '"달을 향해 쏴라. 비록 빗나가더라도 별들 사이에 있게 될 것이다."\n'
            '-- Les Brown (1945-)\n'
            '미국 동기부여 연설가. 버려진 아이에서 세계적 연설가로.\n\n'
            'Shoot for the moon. Even if you miss, you will land among the stars.\n'
            '瞄准月亮射击，即使错过，你也将置身于群星之间。\n\n'
            '꿈 꾸는 45도 TV | Dreaming 45\n'
            'https://dream45.vercel.app\n\n'
            '#Shorts #Dream45 #motivation #quotes #inspiration #LesBrown'
        ),
    },
    {
        'file': 'short-02.mp4',
        'title': '당신의 시간은 한정되어 있다 | Your Time Is Limited -- Steve Jobs',
        'description': (
            '오늘의 명언\n\n'
            '"당신의 시간은 한정되어 있다. 다른 사람의 삶을 사느라 시간을 낭비하지 마라."\n'
            '-- Steve Jobs (1955-2011)\n'
            'Apple 공동 창립자.\n\n'
            'Your time is limited, so don\'t waste it living someone else\'s life.\n\n'
            '꿈 꾸는 45도 TV | Dreaming 45\n'
            'https://dream45.vercel.app\n\n'
            '#Shorts #Dream45 #motivation #SteveJobs #quotes'
        ),
    },
    {
        'file': 'short-07.mp4',
        'title': '불가능은 이루어지기 전까지만 불가능하다 | Nelson Mandela',
        'description': (
            '오늘의 명언\n\n'
            '"불가능해 보이는 것은 이루어지기 전까지만 그렇다."\n'
            '-- Nelson Mandela (1918-2013)\n'
            '남아프리카공화국 최초 흑인 대통령. 27년 투옥을 견딘 자유의 투사.\n\n'
            'It always seems impossible until it\'s done.\n\n'
            '꿈 꾸는 45도 TV | Dreaming 45\n'
            'https://dream45.vercel.app\n\n'
            '#Shorts #Dream45 #motivation #NelsonMandela #impossible'
        ),
    },
    {
        'file': 'short-01.mp4',
        'title': '모든 위대한 꿈은 당신에서 시작된다 | Every Dream Begins With You',
        'description': (
            '오늘의 명언\n\n'
            '"모든 위대한 꿈은 꿈꾸는 자로부터 시작된다."\n'
            '-- Harriet Tubman (1822-1913)\n'
            '미국 노예 해방 운동가.\n\n'
            'Every great dream begins with a dreamer.\n\n'
            '꿈 꾸는 45도 TV | Dreaming 45\n'
            'https://dream45.vercel.app\n\n'
            '#Shorts #Dream45 #motivation #HarrietTubman #dream'
        ),
    },
    {
        'file': 'short-10.mp4',
        'title': '꿈이 두렵지 않다면, 너무 작은 꿈이다 | If Your Dream Doesn\'t Scare You',
        'description': (
            '오늘의 명언\n\n'
            '"만약 당신의 꿈이 당신을 두렵게 하지 않는다면, 그것은 충분히 크지 않은 것이다."\n'
            '-- Ellen Johnson Sirleaf (1938-)\n'
            '아프리카 최초 민선 여성 대통령. 노벨 평화상 수상자.\n\n'
            'If your dreams don\'t scare you, they are too small.\n\n'
            '꿈 꾸는 45도 TV | Dreaming 45\n'
            'https://dream45.vercel.app\n\n'
            '#Shorts #Dream45 #motivation #EllenSirleaf #dream'
        ),
    },
    {
        'file': 'short-04.mp4',
        'title': '일곱 번 넘어져도 여덟 번 일어나라 | Fall Seven Times Stand Up Eight',
        'description': (
            '오늘의 명언\n\n'
            '"일곱 번 넘어지면 여덟 번 일어나라."\n'
            '-- 일본 격언\n\n'
            'Fall seven times, stand up eight.\n\n'
            '꿈 꾸는 45도 TV | Dreaming 45\n'
            'https://dream45.vercel.app\n\n'
            '#Shorts #Dream45 #motivation #challenge #resilience'
        ),
    },
    {
        'file': 'short-05.mp4',
        'title': '미래는 꿈의 아름다움을 믿는 자의 것 | The Future Belongs to Dreamers',
        'description': (
            '오늘의 명언\n\n'
            '"미래는 자신의 꿈의 아름다움을 믿는 사람의 것이다."\n'
            '-- Eleanor Roosevelt (1884-1962)\n\n'
            'The future belongs to those who believe in the beauty of their dreams.\n\n'
            '꿈 꾸는 45도 TV | Dreaming 45\n'
            'https://dream45.vercel.app\n\n'
            '#Shorts #Dream45 #motivation #EleanorRoosevelt #future'
        ),
    },
    {
        'file': 'short-06.mp4',
        'title': '천 리 길도 한 걸음부터 | A Journey of a Thousand Miles -- Laozi',
        'description': (
            '오늘의 명언\n\n'
            '"천 리 길도 한 걸음부터 시작된다."\n'
            '-- 노자 Laozi (BC 6세기)\n'
            '중국 도가 철학의 창시자.\n\n'
            'A journey of a thousand miles begins with a single step.\n\n'
            '꿈 꾸는 45도 TV | Dreaming 45\n'
            'https://dream45.vercel.app\n\n'
            '#Shorts #Dream45 #motivation #Laozi #journey'
        ),
    },
    {
        'file': 'short-03.mp4',
        'title': '어둠을 저주하기보다 촛불 하나를 켜라 | Light a Candle',
        'description': (
            '오늘의 명언\n\n'
            '"어둠을 저주하기보다 촛불 하나를 켜는 것이 낫다."\n'
            '-- Eleanor Roosevelt (1884-1962)\n\n'
            'It is better to light a candle than curse the darkness.\n\n'
            '꿈 꾸는 45도 TV | Dreaming 45\n'
            'https://dream45.vercel.app\n\n'
            '#Shorts #Dream45 #motivation #EleanorRoosevelt #hope'
        ),
    },
    {
        'file': 'short-09.mp4',
        'title': '가장 용감한 행동은 스스로 생각하는 것 | Coco Chanel',
        'description': (
            '오늘의 명언\n\n'
            '"가장 용감한 행동은 스스로 생각하는 것이다. 그리고 그것을 소리 내어 말하는 것이다."\n'
            '-- Coco Chanel (1883-1971)\n'
            '프랑스 패션 디자이너.\n\n'
            'The most courageous act is still to think for yourself. Aloud.\n\n'
            '꿈 꾸는 45도 TV | Dreaming 45\n'
            'https://dream45.vercel.app\n\n'
            '#Shorts #Dream45 #motivation #CocoChanel #courage'
        ),
    },
]


def create_driver():
    """Create Chrome driver using existing user profile."""
    chrome_options = Options()
    user_data = r'C:\Users\User968\AppData\Local\Google\Chrome\User Data'
    chrome_options.add_argument(f'--user-data-dir={user_data}')
    chrome_options.add_argument('--profile-directory=Default')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.implicitly_wait(10)
    return driver


def upload_single(driver, video_info, index, total):
    """Upload a single video via YouTube Studio UI."""
    video_path = str(VIDEOS_DIR / video_info['file'])

    if not os.path.exists(video_path):
        print(f'  [X] File not found: {video_path}')
        return False

    print(f'\n[{index}/{total}] Uploading: {video_info["file"]}')
    print(f'  Title: {video_info["title"][:50]}...')

    try:
        # Go to YouTube Studio upload
        driver.get('https://studio.youtube.com')
        time.sleep(4)

        # Click "Create" button
        try:
            create_btn = WebDriverWait(driver, 15).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, '#create-icon, [id="upload-icon"], ytcp-button#create-icon'))
            )
            create_btn.click()
            time.sleep(2)
        except Exception:
            # Try alternative selector
            try:
                create_btn = driver.find_element(By.XPATH, '//*[contains(@id, "create")]')
                create_btn.click()
                time.sleep(2)
            except Exception:
                print('  [!] Could not find Create button. Trying direct upload URL...')
                driver.get('https://studio.youtube.com/channel/UC/videos/upload?d=ud')
                time.sleep(4)

        # Click "Upload videos" menu item
        try:
            upload_item = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, '#text-item-0, tp-yt-paper-item'))
            )
            upload_item.click()
            time.sleep(3)
        except Exception:
            pass

        # Find file input and upload
        try:
            file_input = WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="file"]'))
            )
            file_input.send_keys(video_path)
            print('  [>] File selected, uploading...')
            time.sleep(8)
        except Exception as e:
            print(f'  [X] Could not find file input: {e}')
            return False

        # Set title
        try:
            title_input = WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '#title-textarea textbox, [id="textbox"][aria-label*="title"], #title-textarea #textbox, ytcp-social-suggestions-textbox #textbox'))
            )
            title_input.clear()
            title_input.click()
            time.sleep(0.5)
            # Select all and replace
            title_input.send_keys(Keys.CONTROL + 'a')
            time.sleep(0.3)
            title_input.send_keys(video_info['title'])
            print(f'  [>] Title set')
            time.sleep(1)
        except Exception as e:
            print(f'  [!] Title input issue: {e}')

        # Set description
        try:
            desc_inputs = driver.find_elements(By.CSS_SELECTOR, '#description-textarea textbox, [aria-label*="description"] #textbox, #description-textarea #textbox')
            if desc_inputs:
                desc_input = desc_inputs[0]
                desc_input.click()
                time.sleep(0.5)
                desc_input.send_keys(video_info['description'])
                print(f'  [>] Description set')
                time.sleep(1)
        except Exception as e:
            print(f'  [!] Description issue: {e}')

        # Set "Not made for kids"
        try:
            not_for_kids = driver.find_elements(By.CSS_SELECTOR, '[name="NOT_MADE_FOR_KIDS"], #radioLabel[name="NOT_MADE_FOR_KIDS"]')
            if not_for_kids:
                not_for_kids[0].click()
                time.sleep(0.5)
            else:
                radios = driver.find_elements(By.CSS_SELECTOR, 'tp-yt-paper-radio-button')
                if len(radios) >= 2:
                    radios[1].click()
                    time.sleep(0.5)
            print(f'  [>] Not made for kids selected')
        except Exception:
            pass

        # Click through steps: Next -> Next -> Next -> Publish
        for step_name in ['Details', 'Elements', 'Checks']:
            try:
                next_btn = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, '#next-button, [id="next-button"]'))
                )
                next_btn.click()
                print(f'  [>] {step_name} -> Next')
                time.sleep(2)
            except Exception:
                pass

        # Set to Public
        try:
            public_radio = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, '[name="PUBLIC"], tp-yt-paper-radio-button[name="PUBLIC"]'))
            )
            public_radio.click()
            print(f'  [>] Set to Public')
            time.sleep(1)
        except Exception:
            pass

        # Click Publish/Done
        try:
            publish_btn = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, '#done-button, [id="done-button"]'))
            )
            publish_btn.click()
            print(f'  [OK] Published: {video_info["file"]}')
            time.sleep(5)
        except Exception as e:
            print(f'  [!] Publish issue: {e}')

        # Close dialog if present
        try:
            close_btn = driver.find_element(By.CSS_SELECTOR, '#close-button, [id="close-button"], ytcp-button[id="close-button"]')
            close_btn.click()
            time.sleep(2)
        except Exception:
            pass

        return True

    except Exception as e:
        print(f'  [X] Upload failed: {e}')
        return False


def main():
    print()
    print('=' * 50)
    print('  Dream 45 -- YouTube Shorts Auto Upload')
    print('  10 videos will be uploaded automatically')
    print('=' * 50)
    print()
    print('Chrome will open with your existing login.')
    print('Please do NOT close the browser window.')
    print()

    # Close existing Chrome first
    print('[*] Please close all Chrome windows first!')
    print('    (Selenium needs exclusive access to Chrome profile)')
    print()
    input_msg = input('Chrome closed? Press Enter to start... ')

    driver = create_driver()
    uploaded = []
    failed = []

    try:
        total = len(SHORTS)
        for i, video_info in enumerate(SHORTS, 1):
            success = upload_single(driver, video_info, i, total)
            if success:
                uploaded.append(video_info['file'])
            else:
                failed.append(video_info['file'])

            if i < total:
                print(f'  Waiting 30 seconds before next upload...')
                time.sleep(30)

    except KeyboardInterrupt:
        print('\n\nUpload interrupted by user.')
    except Exception as e:
        print(f'\nError: {e}')
    finally:
        print()
        print('=' * 50)
        print(f'  Upload complete: {len(uploaded)}/{len(SHORTS)}')
        if uploaded:
            print(f'  Uploaded: {", ".join(uploaded)}')
        if failed:
            print(f'  Failed: {", ".join(failed)}')
        print('=' * 50)

        try:
            driver.quit()
        except Exception:
            pass


if __name__ == '__main__':
    main()
