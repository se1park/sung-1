from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import json
import os

def get_chrome_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # 화면을 띄우지 않고 실행 (필요시 제거)
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    service = Service("C:\\my-backend\\chromedriver.exe")  # 경로에 \\ 사용
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def get_source(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                print("Warning: JSON 파일이 비어 있거나 잘못된 형식입니다. 빈 리스트를 반환합니다.")
                return []
    else:
        print(f"Warning: {file_path} 파일이 존재하지 않습니다. 빈 리스트를 반환합니다.")
        return []
