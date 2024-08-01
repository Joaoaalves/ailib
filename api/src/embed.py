import fitz
from InstructorEmbedding import INSTRUCTOR

model = INSTRUCTOR('hkunlp/instructor-base')

def split_into_paragraphs(text):
    return text.split('\n\n')

def determine_instruction(paragraph):
    if any(word in paragraph.lower() for word in ['introduction', 'overview', 'summary']):
        return "Summarize the following content:"
    elif any(word in paragraph.lower() for word in ['method', 'methodology', 'experiment']):
        return "Describe the methods used:"
    elif any(word in paragraph.lower() for word in ['result', 'finding', 'outcome']):
        return "Explain the results and findings:"
    elif any(word in paragraph.lower() for word in ['discussion', 'analysis', 'interpretation']):
        return "Discuss the analysis and interpretation:"
    else:
        return "Represent the content:"

def getTotalParagraphs(pdf_document):
    total_paragraphs = 0
    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        text = page.get_text("text") 
        paragraphs = split_into_paragraphs(text) 
        total_paragraphs += len([p for p in paragraphs if p.strip()])

    return total_paragraphs

def embed(string, instruction):
    return model.encode([[instruction, string]])[0]

def process_pdf(file_path):
    pdf_document = fitz.open(file_path)
    
    total_paragraphs = getTotalParagraphs(pdf_document)
    processed_paragraphs = 0
    all_embeddings = []

    print()
    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        text = page.get_text("text") 
        paragraphs = split_into_paragraphs(text) 

        for paragraph in paragraphs:
            if paragraph.strip():
                processed_paragraphs += 1
                percentage = (processed_paragraphs / total_paragraphs) * 100

                print(f'\rPercentage of paragraphs embedded: {percentage:.2f}% ({processed_paragraphs}/{total_paragraphs})', end='')

                instruction = determine_instruction(paragraph)

                all_embeddings.append(
                    (paragraph, embed(paragraph, instruction))
                )

    pdf_document.close()
    print()
    return all_embeddings