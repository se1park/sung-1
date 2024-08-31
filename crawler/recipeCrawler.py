import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pymongo import MongoClient

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

class RecipeDataCrawler:
    
    def start(self):
        try:
            print("Data 크롤링 시작")
            driver = get_chrome_driver()

            file_path = 'C:\\my-backend\\sources\\Recipe.json'
            
            # 파일 권한 확인
            if not self.check_file_permissions(file_path):
                print(f"파일 '{file_path}'에 대한 권한 문제가 발생했습니다. 읽기/쓰기 권한을 확인하세요.")
                return False

            json_data = get_source(file_path)

            if not json_data:
                print(f"No URLs found in {file_path}")
                return False

            product_data = self.get_recipe_data(driver, json_data)
            print("Data 크롤링 종료")
            
            # mongoDB 저장
            self.save_to_mongodb(product_data)
            print("mongoDB에 data를 저장되었습니다.")
            
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

    def get_recipe_data(self, driver, json_data):
        recipe_data = []

        for url in json_data:
            driver.get(url)
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'div.view2_summary.st3'))
                )

                name = driver.find_element(By.CSS_SELECTOR, 'div.view2_summary.st3').text
            
                summary_info = driver.find_element(By.CSS_SELECTOR, 'div.view2_summary_info')
                level = summary_info.find_element(By.CSS_SELECTOR, 'span.view2_summary_info3').text
                time = summary_info.find_element(By.CSS_SELECTOR, 'span.view2_summary_info2').text
                servings = summary_info.find_element(By.CSS_SELECTOR, 'span.view2_summary_info1').text
            
                ingredients = []
                ingredient_elements = driver.find_elements(By.CSS_SELECTOR, 'div.ready_ingre3 ul.case1 li')
                for ingredient in ingredient_elements:
                    name_element = ingredient.find_element(By.CSS_SELECTOR, 'div.ingre_list_name').text
                    quantity = ingredient.find_element(By.CSS_SELECTOR, 'span.ingre_list_ea').text
                    ingredients.append(f"{name_element}: {quantity}")
            
                cooking_steps = []
                step_elements = driver.find_elements(By.CSS_SELECTOR, 'div.view_step best_tit')
                for step in step_elements:
                    step_text = step.find_element(By.CSS_SELECTOR, 'div.media-body').text
                    cooking_steps.append(step_text)

                image_element = driver.find_element(By.CSS_SELECTOR, 'div.centeredcrop img#main_thumbs')
                image_url = image_element.get_attribute('src') if image_element else None

                recipe = {
                    'name': name,
                    'level': level,
                    'time': time,
                    'servings': servings,
                    'ingredients': ingredients,
                    'cooking_steps': cooking_steps,
                    'image_url': image_url
                }
                recipe_data.append(recipe)
                print(f"Scraped recipe from {url}: {recipe}")

            except Exception as e:
                print(f"Error scraping recipe data from {url}: {e}")
        with open('C:\\my-backend\\sources\\Recipe_data.json', 'w', encoding='utf-8') as f:
            json.dump(recipe_data, f, ensure_ascii=False, indent=4)

        return recipe_data

    def save_to_mongodb(self, recipe_data):
        mongo_uri = os.getenv('MONGO_URI', 'mongodb+srv://tjdwns8083:12345@cluster0.yfjlzuv.mongodb.net/')
        client = MongoClient(mongo_uri)
        db = client['ouruser']
        collection = db['recipes']

        if recipe_data:
            collection.insert_many(recipe_data)
            print(f"{len(recipe_data)} 개의 레시피가 MongoDB에 저장되었습니다.")
        else:
            print("저장할 데이터가 없습니다.")

        client.close()

if __name__ == "__main__":
    data_crawler = RecipeDataCrawler()
    data_crawler.start()
