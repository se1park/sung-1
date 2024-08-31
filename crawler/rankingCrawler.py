import json
import os
import re
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver
from pymongo import MongoClient

def get_chrome_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    service = Service("C:\\my-backend\\chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=options)
    return driver

class ChickenBreastDataCrawler:
    def load_urls(self, file_path):
        """JSON 파일에서 URL 목록을 불러옵니다."""
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                try:
                    return json.load(f)
                except json.JSONDecodeError as e:
                    print(f"JSONDecodeError: {e}")
                    return []
        else:
            print(f"File '{file_path}' not found.")
            return []

    def get_product_data(self, driver, urls):
        product_data = []

        for url in urls:
            driver.get(url)
            try:
                # 페이지 로딩 시간 늘리기
                WebDriverWait(driver, 17).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'div.goods-info-area h2.goods-tit'))
                )

                # 데이터 수집
                name = driver.find_element(By.CSS_SELECTOR, 'div.goods-info-area h2.goods-tit').text
                price = driver.find_element(By.CSS_SELECTOR, 'div.goods-price p.price').text
                
                # 가격 처리
                price = re.sub(r'[^\d]', '', price)  # 숫자 이외의 문자를 제거

                try:
                    image_element = driver.find_element(By.CSS_SELECTOR, 'div.goods-top div.img img')
                    image = image_element.get_attribute('src') if image_element else "N/A"
                    if image:
                        print(f"Collected image URL: {image}")
                    else:
                        print("Image src attribute is empty or missing.")
                except Exception as e:
                    image = "N/A"

                try:
                    rating_class = driver.find_element(By.CSS_SELECTOR, 'div.rating-div a.rating-point-md').text
                    # 평점 처리
                    rating = re.sub(r'\n별점', '', rating_class).strip()  # \n별점 제거 및 공백 제거
                    print(f"Collected rating: {rating}")
                except:
                    rating = "N/A"

                try:
                    # 맛 옵션 드롭다운을 클릭하여 열기
                    flavor_dropdown = driver.find_element(By.CSS_SELECTOR, 'div.dropdown-box.w-full a.dropdown-value')
                    flavor_dropdown.click()

                    # 드롭다운에서 옵션을 선택하여 텍스트를 가져오기
                    WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, 'div.dropdown-box.w-full.on'))
                    )
                    flavor_elements = driver.find_elements(By.CSS_SELECTOR, 'div.dropdown-list ul.selected-options-ul1 li.add-fee span.add-fee-name')
                    flavors = [element.text for element in flavor_elements if not re.search(r'\d+팩', element.text)]
                except:
                    flavors = []
                print(f"Collected flavors: {flavors}")

                product = {
                    'name': name,
                    'flavor': flavors,
                    'price': price,
                    'image_url': image,
                    'rating': rating
                }
                product_data.append(product)

            except Exception as e:
                print(f"Error scraping product data from {url}: {e}")

        # 크롤링된 데이터를 JSON 파일에 저장
        with open('C:\\my-backend\\sources\\ChickenBreast_data.json', 'w', encoding='utf-8') as f:
            json.dump(product_data, f, ensure_ascii=False, indent=4)

        return product_data

    def save_to_mongodb(self, product_data):
        mongo_uri = os.getenv('MONGO_URI', 'mongodb+srv://tjdwns8083:12345@cluster0.yfjlzuv.mongodb.net/')
        client = None  # client 변수를 None으로 초기화
        
        try:
            client = MongoClient(mongo_uri)
            db = client['ouruser']
            collection = db['chickenbreasts']

            if product_data:
                collection.insert_many(product_data)
                print(f"Successfully saved {len(product_data)} products to MongoDB.")
            else:
                print("No data to save.")
                
        except Exception as e:
            print(f"Error saving data to MongoDB: {e}")
        
        finally:
            if client:
                client.close()

if __name__ == "__main__":
    crawler = ChickenBreastDataCrawler()
    file_path = 'C:\\my-backend\\sources\\ChickenBreast.json'
    urls = crawler.load_urls(file_path)
    
    if urls:
        driver = get_chrome_driver()
        product_data = crawler.get_product_data(driver, urls)
        crawler.save_to_mongodb(product_data)
    else:
        print("No URLs found to crawl.")
