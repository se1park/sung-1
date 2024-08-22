import json
import os
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium import webdriver
from pymongo import MongoClient

# get_chrome_driver 함수 정의
def get_chrome_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    service = Service("C:\\my-backend\\chromedriver.exe")  # 크롬드라이버의 경로로 변경
    driver = webdriver.Chrome(service=service, options=options)
    return driver

class RecipeDataCrawler:
    def load_urls(self, file_path):
        """JSON 파일에서 URL 목록을 불러옵니다."""
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            print(f"File '{file_path}' not found.")
            return []