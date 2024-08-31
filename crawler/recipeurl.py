import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pymongo import MongoClient
import time

def get_chrome_driver():
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    service = Service("C:\\my-backend\\chromedriver.exe")
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

class RecipeURLCrawler:
    
    def start(self):
        try:
            print("URL 크롤링 시작")
            driver = get_chrome_driver()

            file_path = 'C:\\my-backend\\sources\\Recipe.json'
            
            # 파일 권한 확인
            if not self.check_file_permissions(file_path):
                print(f"파일 '{file_path}'에 대한 권한 문제가 발생했습니다. 읽기/쓰기 권한을 확인하세요.")
                return False

            json_data = get_source(file_path)

            if not json_data:
                print("No URLs found in JSON, starting URL crawling")
                json_data = self.get_recipe_urls(driver)
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(json_data, f, ensure_ascii=False, indent=4)

            print("URL 크롤링 종료")
            print("----------------------------")
            
            self.save_urls_to_mongodb(json_data)
            print("URL 데이터가 MongoDB에 저장되었습니다.")
            
            return True
        except Exception as e:
            print(f"크롤링 중 오류 발생: {e}")
            return False
        finally:
            if driver:
                driver.quit()

    def check_file_permissions(self, file_path):
        if os.path.exists(file_path):
            can_read = os.access(file_path, os.R_OK)
            can_write = os.access(file_path, os.W_OK)
            print(f"Can read: {can_read}")
            print(f"Can write: {can_write}")
            return can_read and can_write
        else:
            print(f"Warning: {file_path} 파일이 존재하지 않습니다.")
            return False

    def hide_ads(self, driver):
        try:
            ad_elements = [
                '#wtgSticky',
                '#wtgStickyWrapper',
                'iframe',
            ]
        
            for selector in ad_elements:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    driver.execute_script("arguments[0].style.visibility='hidden'", element)
        except Exception as e:
            print(f"광고 숨김 처리 중 오류 발생: {e}")

    def get_recipe_urls(self, driver):
        recipe_urls = []
        target_url = "https://www.10000recipe.com/recipe/list.html?q=%EB%8B%AD%EA%B0%80%EC%8A%B4%EC%82%B4"
        driver.get(target_url)

        while True:
            try:
                self.hide_ads(driver)
                recipes = driver.find_elements(By.CSS_SELECTOR, 'div.common_sp_thumb a.common_sp_link')

                for recipe in recipes:
                    url = recipe.get_attribute('href')
                    if url and url not in recipe_urls:
                        recipe_urls.append(url)
                    
                pagination_elements = WebDriverWait(driver, 20).until(
                    EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'nav.text-center ul.pagination'))
                )
                pagination = pagination_elements[0] if pagination_elements else None

                if not pagination:
                    break

                next_buttons = pagination.find_elements(By.TAG_NAME, 'li')
                current_page = None
                for button in next_buttons:
                    if 'active' in button.get_attribute('class'):
                        current_page = button.text
                        break

                if current_page:
                    next_page = int(current_page) + 1
                    next_page_selector = f'li:not(.active) a[href*="page={next_page}"]'
                    next_page_element = pagination.find_element(By.CSS_SELECTOR, next_page_selector)

                    if next_page_element:
                        print(f"Navigating to page {next_page}")
                        driver.execute_script("arguments[0].click();", next_page_element)

                        WebDriverWait(driver, 20).until(
                            EC.staleness_of(next_page_element)
                        )
                    else:
                        break
                else:
                    break

            except Exception as e:
                print(f"페이지를 찾거나 클릭하는 데 오류가 발생했습니다: {e}")
                break

        print(f"Collected recipe URLs: {recipe_urls}")
        return recipe_urls

    def save_urls_to_mongodb(self, urls):
        mongo_uri = os.getenv('MONGO_URI', 'mongodb+srv://tjdwns8083:12345@cluster0.yfjlzuv.mongodb.net/')
        client = None  # client 변수를 None으로 초기화
        
        try:
            client = MongoClient(mongo_uri)
            db = client['ouruser']
            collection = db['crawlerrecipes']

            if urls:
                url_documents = [{'url': url} for url in urls]  # URL을 문서로 변환
                collection.insert_many(url_documents)
                print(f"Successfully saved {len(url_documents)} URLs to MongoDB.")
            else:
                print("No URLs to save.")
                
        except Exception as e:
            print(f"Error saving URLs to MongoDB: {e}")
        
        finally:
            if client:
                client.close()

if __name__ == "__main__":
    url_crawler = RecipeURLCrawler()
    url_crawler.start()
