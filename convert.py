import re
import json
import os

def clean_text(text):
    return re.sub(r'\s+', ' ', text).strip()

def convert_bible_to_shards(input_file, output_base_dir):
    verse_pattern = re.compile(r'(\d+):(\d+)\s+')
    
    START_MARKER = "*** START OF THE PROJECT GUTENBERG EBOOK THE KING JAMES VERSION OF THE BIBLE ***"
    END_MARKER = "*** END OF THE PROJECT GUTENBERG EBOOK THE KING JAMES VERSION OF THE BIBLE ***"

    # Updated with flexible ordering for "General" and "Epistle"
    kjv_books_info = [
        (r"The First Book of Moses[: ,]+Called Genesis", "Genesis"),
        (r"The Second Book of Moses[: ,]+Called Exodus", "Exodus"),
        (r"The Third Book of Moses[: ,]+Called Leviticus", "Leviticus"),
        (r"The Fourth Book of Moses[: ,]+Called Numbers", "Numbers"),
        (r"The Fifth Book of Moses[: ,]+Called Deuteronomy", "Deuteronomy"),
        (r"The Book of Joshua", "Joshua"),
        (r"The Book of Judges", "Judges"),
        (r"The Book of Ruth", "Ruth"),
        (r"The First Book of Samuel", "1 Samuel"),
        (r"The Second Book of Samuel", "2 Samuel"),
        (r"The First Book of the Kings", "1 Kings"),
        (r"The Second Book of the Kings", "2 Kings"),
        (r"The First Book of the Chronicles", "1 Chronicles"),
        (r"The Second Book of the Chronicles", "2 Chronicles"),
        (r"Ezra", "Ezra"),
        (r"The Book of Nehemiah", "Nehemiah"),
        (r"The Book of Esther", "Esther"),
        (r"The Book of Job", "Job"),
        (r"The Book of Psalms", "Psalms"),
        (r"The Proverbs", "Proverbs"),
        (r"Ecclesiastes", "Ecclesiastes"),
        (r"The Song of Solomon", "Song of Solomon"),
        (r"The Book of the Prophet Isaiah", "Isaiah"),
        (r"The Book of the Prophet Jeremiah", "Jeremiah"),
        (r"The Lamentations of Jeremiah", "Lamentations"),
        (r"The Book of the Prophet Ezekiel", "Ezekiel"),
        (r"The Book of (the Prophet )?Daniel", "Daniel"),
        (r"Hosea", "Hosea"), (r"Joel", "Joel"), (r"Amos", "Amos"), (r"Obadiah", "Obadiah"),
        (r"Jonah", "Jonah"), (r"Micah", "Micah"), (r"Nahum", "Nahum"), (r"Habakkuk", "Habakkuk"),
        (r"Zephaniah", "Zephaniah"), (r"Haggai", "Haggai"), (r"Zechariah", "Zechariah"), (r"Malachi", "Malachi"),
        (r"The Gospel According to (St\.|Saint )?Matthew", "Matthew"),
        (r"The Gospel According to (St\.|Saint )?Mark", "Mark"),
        (r"The Gospel According to (St\.|Saint )?Luke", "Luke"),
        (r"The Gospel According to (St\.|Saint )?John", "John"),
        (r"The Acts of the Apostles", "Acts"),
        (r"The Epistle of Paul the Apostle to the Romans", "Romans"),
        (r"The First Epistle of Paul the Apostle to the Corinthians", "1 Corinthians"),
        (r"The Second Epistle of Paul the Apostle to the Corinthians", "2 Corinthians"),
        (r"The Epistle of Paul the Apostle to the Galatians", "Galatians"),
        (r"The Epistle of Paul the Apostle to the Ephesians", "Ephesians"),
        (r"The Epistle of Paul the Apostle to the Philippians", "Philippians"),
        (r"The Epistle of Paul the Apostle to the Colossians", "Colossians"),
        (r"The First Epistle of Paul the Apostle to the Thessalonians", "1 Thessalonians"),
        (r"The Second Epistle of Paul the Apostle to the Thessalonians", "2 Thessalonians"),
        (r"The First Epistle of Paul the Apostle to Timothy", "1 Timothy"),
        (r"The Second Epistle of Paul the Apostle to Timothy", "2 Timothy"),
        (r"The Epistle of Paul the Apostle to Titus", "Titus"),
        (r"The Epistle of Paul the Apostle to Philemon", "Philemon"),
        (r"The Epistle of Paul the Apostle to the Hebrews", "Hebrews"),
        (r"The (General |Epistle )+of James", "James"),
        (r"The First (General |Epistle )+of Peter", "1 Peter"),
        (r"The Second (General |Epistle )+of Peter", "2 Peter"),
        (r"The First (General |Epistle )+of John", "1 John"),
        (r"The Second (General |Epistle )+of John", "2 John"),
        (r"The Third (General |Epistle )+of John", "3 John"),
        (r"The (General |Epistle )+of Jude", "Jude"),
        (r"The Revelation of (St\.|Saint )?John the Divine", "Revelation")
    ]

    try:
        with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
            full_text = f.read()

        upper_text = full_text.upper()
        start_idx = upper_text.find(START_MARKER.upper())
        end_idx = upper_text.find(END_MARKER.upper())
        content = full_text[start_idx + len(START_MARKER) : end_idx] if (start_idx != -1) else full_text

        book_positions = []
        for pattern, display_name in kjv_books_info:
            # Replaces spaces with whitespace matcher
            regex_pattern = pattern.replace(' ', r'\s+')
            matches = list(re.finditer(regex_pattern, content, re.IGNORECASE))
            
            best_match = None
            min_dist = 999999
            
            for m in matches:
                # Gutenberg headers are usually within 3000 chars of 1:1
                v_match = re.search(r"1:1\s+", content[m.end():m.end()+3000])
                if v_match:
                    if v_match.start() < min_dist:
                        min_dist = v_match.start()
                        best_match = m
            
            if best_match:
                book_positions.append((best_match.start(), display_name))
            else:
                print(f"Warning: Missing {display_name}")

        book_positions.sort()

        book_index = []
        for i in range(len(book_positions)):
            start_p, b_name = book_positions[i]
            end_p = book_positions[i+1][0] if i+1 < len(book_positions) else len(content)
            
            book_slug = b_name.lower().replace(" ", "-")
            book_dir = os.path.join(output_base_dir, book_slug)
            os.makedirs(book_dir, exist_ok=True)

            book_text = content[start_p:end_p]
            parts = verse_pattern.split(book_text)
            
            chapters = {}
            for j in range(1, len(parts), 3):
                c_num, v_num = str(int(parts[j])), str(int(parts[j+1]))
                if c_num not in chapters: chapters[c_num] = {}
                chapters[c_num][v_num] = f"<sup>{v_num}</sup> {clean_text(parts[j+2])}"

            for ch, verses in chapters.items():
                with open(os.path.join(book_dir, f"{ch}.json"), 'w') as out:
                    json.dump(verses, out)

            book_index.append({
                "name": b_name,
                "slug": book_slug,
                "chapters": len(chapters)
            })

        # Save the index with chapter counts for the Sidebar
        with open(os.path.join(output_base_dir, 'books.json'), 'w') as f:
            json.dump(book_index, f, indent=2)

        print(f"Successfully processed {len(book_positions)} books into {output_base_dir}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    convert_bible_to_shards('bible.txt', 'public/data/bible')