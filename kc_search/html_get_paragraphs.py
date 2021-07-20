from bs4 import BeautifulSoup as soup
import os

DOCUMENTS_DIR = "documents"

def main():
    items = [file for file in os.listdir(DOCUMENTS_DIR)]
    for item in items:
        with open(os.path.join(DOCUMENTS_DIR,item),"r") as fp:
            html = soup(fp.read(),"lxml")
        print(item)
        for paragraph in html.find_all("p"):
            print(paragraph.text)
        print("-"*20)


if __name__ == '__main__':
    main()