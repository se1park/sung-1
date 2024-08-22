import json
import os
from bs4 import BeautifulSoup
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

class ChickenBreastDataCrawler:
    def load_urls(self, file_path):
        """JSON 파일에서 URL 목록을 불러옵니다."""
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            print(f"File '{file_path}' not found.")
            return []

    def get_product_data(self, driver, urls):
        product_data = []

        for url in urls:
            driver.get(url)
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'div.top-badge img'))
                )

                name = driver.find_element(By.CSS_SELECTOR, 'h2.goods-tit p.tit-sub').text
                price = driver.find_element(By.CSS_SELECTOR, 'div.goods-price p.price').text
                image_url = driver.find_element(By.CSS_SELECTOR, 'div.img img').get_attribute('src')

                # 평점과 맛 정보 추가
                try:
                    rating_class = driver.find_element(By.CSS_SELECTOR, 'a.rating-point-md span:first-child').get_attribute('class')
                    rating = rating_class.replace('point', '')
                    rating = f"{rating[0]}.{rating[1]}"
                except:
                    rating = "N/A"

                try:
                    flavor_elements = driver.find_elements(By.CSS_SELECTOR, 'ul.selected-options-ul1 li span.add-fee-name')
                    flavors = [element.text for element in flavor_elements]
                except:
                    flavors = []

                product = {
                    'name': name,
                    'flavor': flavors,
                    'price': price,
                    'image_url': image_url,
                    'rating': rating
                }


                print(f"Crawled data: {product_data[-1]}")
                print("Scraped data:", product)  # 데이터 확인용
                product_data.append(product)
            except Exception as e:
                print(f"Error scraping product data from {url}: {e}")

        return product_data


    def save_to_mongodb(self, product_data):
        mongo_uri = os.getenv('MONGO_URI', 'mongodb+srv://tjdwns8083:12345@cluster0.mongodb.net/ouruser?retryWrites=true&w=majority')  # MongoDB Atlas URI로 변경
        client = MongoClient(mongo_uri)
        db = client['ouruser']
        collection = db['cralwerchickenbreasts']

        try:
            if product_data:
                collection.insert_many(product_data)
                print(f"Successfully saved {len(product_data)} products to MongoDB.")
            else:
                print("No data to save.")
        except Exception as e:
            print(f"Error saving data to MongoDB: {e}")
        client.close()

if __name__ == "__main__":
    crawler = ChickenBreastDataCrawler()

    # JSON 파일 경로
    file_path = 'C:\\my-backend\\sources\\ChickenBreast_data.json'

    # URL 로드
    urls = crawler.load_urls(file_path)

    if urls:
        driver = get_chrome_driver()
        product_data = crawler.get_product_data(driver, urls)
        crawler.save_to_mongodb(product_data)
