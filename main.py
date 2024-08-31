from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium import webdriver
from pymongo import MongoClient
from utils import get_chrome_driver, get_source
import time
import json
import os

class ChickenBreastControl:
    def start(self):
        try:
            print("URL 크롤링 시작")
            driver = get_chrome_driver()

            file_path = 'C:\\my-backend\\sources\\ChickenBreast.json'

            # 파일 권한 확인
            if not self.check_file_permissions(file_path):
                print(f"파일 '{file_path}'에 대한 권한 문제가 발생했습니다. 읽기/쓰기 권한을 확인하세요.")
                return False

            json_data = get_source(file_path)

            if not json_data:  # URL 데이터가 없으면 URL을 크롤링하여 가져옵니다.
                print("No URLs found in JSON, starting URL crawling")
                json_data = self.get_product_urls(driver)
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(json_data, f, ensure_ascii=False, indent=4)

            print("URL 크롤링 종료")
            print("-------------------------")

            # MongoDB에 URL 데이터 저장
            self.save_urls_to_mongodb(json_data)
            print("URL 데이터가 MongoDB에 저장되었습니다.")
            
            return True
        except Exception as e:
            print(e)
            return False

    def check_file_permissions(self, file_path):
        """파일의 읽기 및 쓰기 권한을 확인합니다."""
        if os.path.exists(file_path):
            can_read = os.access(file_path, os.R_OK)
            can_write = os.access(file_path, os.W_OK)
            print(f"Can read: {can_read}")
            print(f"Can write: {can_write}")
            return can_read and can_write
        else:
            print(f"Warning: {file_path} 파일이 존재하지 않습니다.")
            return False

    def get_product_urls(self, driver):
        product_urls = []
        target_url = "https://www.rankingdak.com/product/list?depth1=R019"
        driver.get(target_url)

        while True:
            try:
                # 페이지 스크롤 다운
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'div.btn-more-box button.btn-article-md.btn-gift-more'))
                )
                
                # "더 보기" 버튼 클릭
                more_button = driver.find_element(By.CSS_SELECTOR, 'div.btn-more-box button.btn-article-md.btn-gift-more')
                # 버튼이 화면에 정확히 나타나도록 스크롤
                driver.execute_script("arguments[0].scrollIntoView(true);", more_button)
                time.sleep(1)  # 스크롤 후 잠깐 대기
                
                # 다른 요소에 의해 가려지지 않도록 안전하게 클릭
                actions = ActionChains(driver)
                actions.move_to_element(more_button).click().perform()
                time.sleep(2)

                # 제품 링크 추출
                products = driver.find_elements(By.CSS_SELECTOR, 'p.tit a.text-elps2')
                for product in products:
                    url = product.get_attribute('href')
                    if url not in product_urls:
                        product_urls.append(url)

            except Exception as e:
                print(f"더 보기 버튼을 찾거나 클릭하는 데 오류가 발생했습니다: {e}")
                break

        return product_urls

    def save_urls_to_mongodb(self, urls):
        mongo_uri = os.getenv('MONGO_URI', 'mongodb+srv://tjdwns8083:12345@cluster0.yfjlzuv.mongodb.net/')
        client = None  # client 변수를 None으로 초기화
        
        try:
            client = MongoClient(mongo_uri)
            db = client['ouruser']
            collection = db['crawlerchickenbreasts']

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
    crawler = ChickenBreastControl()
    crawler.start()
