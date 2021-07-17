import os
import sys
import requests
import json

AUTH_FILE = "auth.json"
SAMPLE_FILE = "sample.json"

ignore = ["...","the","as","a","to","or"]



def main():
    results = ""
    # if the sample search file does not exist, generate one
    if not os.path.exists(SAMPLE_FILE):
        print("fetching results from web")
        if not os.path.exists(AUTH_FILE):
            print(f"ask dev jasper for {AUTH_FILE}, or create your own with a key from your google account",file=sys.stderr)
            exit(1)
            
        with open(AUTH_FILE,"r") as fp:
            auth_data = json.load(fp)
        key = auth_data["key"]
        engine = auth_data["engine"]
        query = "HEVC"
        response = requests.get(f"https://www.googleapis.com/customsearch/v1?key={key}&cx={engine}&q={query}")
        with open(SAMPLE_FILE,"w") as fp:
            fp.write(response.text)
    
    # read in json search from saved file
    # this is just a temporary measure to reduce queries while testing
    with open(SAMPLE_FILE) as fp:
        print("loading results from file")
        results = json.load(fp)

    snippet_words = []
    
    for item in results["items"]:
        print(item["link"])
        snippet_words.extend([w.lower() for w in item["snippet"].split()])
    
    # we would wand some kind of system that finds common terms
    # such as two or more words that frequently appear together 
    unique_words = list(set(snippet_words))
    word_counts = {}
    for word in unique_words:
        word_counts[word] = snippet_words.count(word)
    # filter for words that appear in at least half of the results
    word_counts = [(k,v) for k,v in word_counts.items() if v >= (len(results["items"])//2) and not k in ignore]
    word_counts = list(sorted(word_counts,key=lambda p: p[1], reverse=True))
    terms = [k for k,_ in word_counts]
    print(terms)
    
    


if __name__ == "__main__":
    main()