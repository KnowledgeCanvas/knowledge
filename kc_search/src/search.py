import os
import sys
import requests
import json
from hashlib import md5 as hash
import shutil

AUTH_FILE = "/Users/rob/Developer/knowledge-canvas/kc_search/src/auth.json"
USER_AGENT = "knowledge-canvas/0.0.1"
DOCUMENTS_DIR = "documents"
ignore = ["...","the","as","a","to","or","with","in","also","is","and","of"]
RAW_FORMATS = ["pdf","docx","png","jpeg","jpg"]




def main(query):
    # make a hash of the query so we can store it as the directory name
    query_hash = hash(query.encode()).hexdigest()

    # create a directory to store the results in 
    results_dir = os.path.join(DOCUMENTS_DIR,query_hash)
    results_cache = os.path.join(results_dir,"search_results.json")
    os.makedirs(results_dir,exist_ok=True)
    
    results = ""
    
    # if the sample search file does not exist, generate one
    if not os.path.exists(results_cache):
#         print("fetching results from web")
        if not os.path.exists(AUTH_FILE):
            print(f"ask dev jasper for {AUTH_FILE}, or create your own with a key from your google account",file=sys.stderr)
            exit(1)
            
        with open(AUTH_FILE,"r") as fp:
            auth_data = json.load(fp)
        key = auth_data["key"]
        engine = auth_data["engine"]
        headers = {"User-Agent": USER_AGENT}
        response = requests.get(f"https://www.googleapis.com/customsearch/v1?key={key}&cx={engine}&q={query}",headers=headers)
        response.json()
        with open(results_cache,"w") as fp:
            fp.write(response.text)
    
    # read in json search from saved file
    # this is just a temporary measure to reduce queries while testing
    with open(results_cache) as fp:
#         print("loading results from file")
        results = json.load(fp)

    # make dir for saved documents
    if not os.path.exists(results_dir):
        os.mkdir(results_dir)
    snippet_words = []
    headers = {"User-Agent": USER_AGENT}

    for item in results["items"]:
        # download each of the linked documents
        link = item["link"]
        formatted_link = item["formattedUrl"]
        name = f"{item['displayLink']}_{os.path.basename(formatted_link[:-1] if link.endswith('/') else formatted_link)}"
        raw = name.split(".")[-1] in RAW_FORMATS
        
        if raw:
            path = os.path.join(results_dir,os.path.basename(link))
        else:
            path = os.path.join(results_dir,f"{name}.html")
        
        if not os.path.exists(path):
#             print("getting",link)
#             print("saving to",str(path))
            response = requests.get(link,stream=raw)
            if raw:
                with open(path,"wb") as fp:
                    shutil.copyfileobj(response.raw,fp)
            else:
                with open(path,"w") as fp:
                    fp.write(response.text)
        
        snippet_words.extend([w.lower() for w in item["snippet"].split()])
    # Tika extract the text from the downloaded documents and perform analysis on those
    # find terms and do some more searches to build the web
    

    ### basic finding terms demo ###

    # we would wand some kind of system that finds common terms
    # such as two or more words that frequently appear together 
    unique_words = list(set(snippet_words))
    word_counts = {}
    for word in unique_words:
        word_counts[word] = snippet_words.count(word)
    # filter for words that appear in at least 1/3 of the results
    word_counts = [(k,v) for k,v in word_counts.items() if v >= (len(results["items"])//3) and not k in ignore]
    word_counts = list(sorted(word_counts,key=lambda p: p[1], reverse=True))
    
    # these are the terms that we could do additional searches on
    terms = [k for k,_ in word_counts]
#     print(terms)
    
    


if __name__ == "__main__":
    main(" ".join(sys.argv[1:]))
