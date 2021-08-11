import argparse
import tika
import nltk
import math
import tkinter
from pprint import pprint
from nltk.corpus import treebank
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize, sent_tokenize
from tika import parser
from nltk.corpus import treebank
import matplotlib

matplotlib.use('agg')
import matplotlib.pyplot as plt

tika.initVM()
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')
nltk.download('maxent_ne_chunker')
nltk.download('words')
nltk.download('treebank')

def _create_frequency_matrix(sentences):
    frequency_matrix = {}
    stopWords = set(stopwords.words("english"))

    # to convert words to root words (stemming)
    ps = PorterStemmer()

    for sent in sentences:
        freq_table = {}
        words = word_tokenize(sent)

        # word -> lowercase -> root word
        # keep count of each word.
        for word in words:
            word = word.lower()
            word = ps.stem(word)
            if word in stopWords:
                continue

            if word in freq_table:
                freq_table[word] += 1
            else:
                freq_table[word] = 1

        frequency_matrix[sent[:15]] = freq_table

    return frequency_matrix

def _create_tf_matrix(freq_matrix):
    # term frequency matrix

    tf_matrix = {}

    for sent, f_table in freq_matrix.items():
        tf_table = {}

        count_words_in_sentence = len(f_table)
        for word, count in f_table.items():
            tf_table[word] = count / count_words_in_sentence

        tf_matrix[sent] = tf_table

    return tf_matrix

def _create_documents_per_words(freq_matrix):
    # count how many times each word occurs in the entire document
    word_per_doc_table = {}

    for sent, f_table in freq_matrix.items():
        for word, count in f_table.items():
            if word in word_per_doc_table:
                word_per_doc_table[word] += 1
            else:
                word_per_doc_table[word] = 1

    return word_per_doc_table

def _create_idf_matrix(freq_matrix, dock_per_words, total_documents):
    idf_matrix = {}

    for sent, f_table in freq_matrix.items():
        idf_table = {}

        for word in f_table.keys():
            idf_table[word] = math.log10(
                total_documents / float(dock_per_words[word]))

        idf_matrix[sent] = idf_table

    return idf_matrix

def _create_tf_idf_matrix(tf_matrix, idf_matrix):
    tf_idf_matrix = {}

    for (sent1, f_table1), (sent2, f_table2) in zip(tf_matrix.items(),
                                                    idf_matrix.items()):

        tf_idf_table = {}

        # here, keys are the same in both the table
        for (word1, value1), (word2, value2) in zip(f_table1.items(),
                                                    f_table2.items()):
            tf_idf_table[word1] = float(value1 * value2)

        tf_idf_matrix[sent1] = tf_idf_table

    return tf_idf_matrix

def _score_sentences(tf_idf_matrix) -> dict:
    """
    score a sentence by its word's TF
    Basic algorithm: adding the TF frequency of every non-stop word in
    a sentence divided by total no of words in a sentence.
    :rtype: dict
    """

    sentenceValue = {}

    for sent, f_table in tf_idf_matrix.items():
        total_score_per_sentence = 0

        word_in_sent = len(f_table)
        for word, score in f_table.items():
            total_score_per_sentence += score

        sentenceValue[sent] = total_score_per_sentence / word_in_sent

    return sentenceValue

def _find_average_score(sentenceValue) -> int:
    """
    Find the average score from the sentence value dictionary
    :rtype: int
    """
    sumValues = 0
    for entry in sentenceValue:
        sumValues += sentenceValue[entry]

    # Average value of a sentence from original summary_text
    average = (sumValues / len(sentenceValue))

    return average

def _generate_summary(sentences, sent_val, threshold):
    sentence_count = 0
    summary = ''

    for sent in sentences:
        if sent[:15] in sent_val and sent_val[sent[:15]] >= (threshold):
            summary += " " + sent
            sentence_count += 1

    return summary


if __name__ == '__main__':
    # TODO: parse command line arguments for filename
    filename = ""
    weight = 1
    parsed = parser.from_file(filename)
    text = parsed["content"].strip()

    # break the text up into individual sentences
    sentences = sent_tokenize(text)
    total_documents = len(sentences)
    # print(sentences)

    freq_matrix = _create_frequency_matrix(sentences)
    # pprint(freq_matrix)

    tf_matrix = _create_tf_matrix(freq_matrix)
    # pprint(tf_matrix)

    count_doc_per_words = _create_documents_per_words(freq_matrix)
    # print(count_doc_per_words)

    idf_matrix = _create_idf_matrix(
        freq_matrix, count_doc_per_words, total_documents)
    # print(idf_matrix)

    tf_idf_matrix = _create_tf_idf_matrix(tf_matrix, idf_matrix)
    # print(tf_idf_matrix)

    sentence_scores = _score_sentences(tf_idf_matrix)
    # print(sentence_scores)

    threshold = _find_average_score(sentence_scores)
    summary = _generate_summary(sentences, sentence_scores, weight * threshold)

    tokens = nltk.word_tokenize(sentences[0])
    tagged = nltk.pos_tag(tokens)
    entities = nltk.chunk.ne_chunk(tagged)

    sentences.draw()
