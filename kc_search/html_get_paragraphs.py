from bs4 import BeautifulSoup as soup
import os
import sys

def main(path):
    items = [file for file in os.listdir(path)]
    for item in items:
        if item.endswith("html"):
            with open(os.path.join(path,item),"r") as fp:
                html = soup(fp.read(),"lxml")
            print(item)
            # grab all the header tags
            for header in html.find_all("h1"):
                pass
            for paragraph in html.find_all("p"):
                print(paragraph.text)
            print("-"*20)


if __name__ == '__main__':
    main(" ".join(sys.argv[1:]))