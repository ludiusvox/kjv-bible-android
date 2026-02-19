import re
import json

def convert_bible_to_ts(input_file, output_file):
    # Matches "1:1 " style verse markers
    verse_pattern = re.compile(r'(\d+):(\d+)\s+')
    
    START_MARKER = "*** START OF THE PROJECT GUTENBERG EBOOK THE KING JAMES VERSION OF THE BIBLE ***"
    END_MARKER = "*** END OF THE PROJECT GUTENBERG EBOOK THE KING JAMES VERSION OF THE BIBLE ***"

    # Robust Book info with flexible spacing and punctuation
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
        (r"The Gospel According to (Saint )?Matthew", "Matthew"),
        (r"The Gospel According to (Saint )?Mark", "Mark"),
        (r"The Gospel According to (Saint )?Luke", "Luke"),
        (r"The Gospel According to (Saint )?John", "John"),
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
        (r"The General Epistle of James", "James"),
        (r"The First Epistle General of Peter", "1 Peter"),
        (r"The Second General Epistle of Peter", "2 Peter"),
        (r"The First Epistle General of John", "1 John"),
        (r"The Second Epistle General of John", "2 John"),
        (r"The Third Epistle General of John", "3 John"),
        (r"The General Epistle of Jude", "Jude"),
        (r"The Revelation of Saint John the Divine", "Revelation")
    ]

    try:
        with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
            full_text = f.read()

        # Locate Gutenberg markers (case-insensitive)
        upper_text = full_text.upper()
        start_idx = upper_text.find(START_MARKER.upper())
        end_idx = upper_text.find(END_MARKER.upper())

        if start_idx != -1 and end_idx != -1:
            content = full_text[start_idx + len(START_MARKER) : end_idx]
        else:
            print("Warning: Start/End markers not found. Processing whole file.")
            content = full_text

        book_positions = []
        
        for pattern, display_name in kjv_books_info:
            # Create regex to handle line breaks and spaces between words
            regex_pattern = pattern.replace(r'\ ', r'\s+').replace(r'\:', r'[:,\s]+')
            matches = list(re.finditer(regex_pattern, content, re.IGNORECASE))
            
            best_match = None
            min_dist = 999999
            
            for m in matches:
                # Look for the verse "1:1" following the title
                v_match = re.search(r"1:1\s+", content[m.end():m.end()+1500])
                if v_match:
                    dist = v_match.start()
                    # The "Header" will be much closer to 1:1 than a TOC entry
                    if dist < min_dist:
                        min_dist = dist
                        best_match = m
            
            if not best_match:
                # Fallback to display name check
                short_m = re.search(r"^\s*" + re.escape(display_name) + r"\s*$", content, re.M | re.IGNORECASE)
                if short_m and re.search(r"1:1\s+", content[short_m.end():short_m.end()+1500]):
                    best_match = short_m

            if best_match:
                book_positions.append((best_match.start(), display_name))
            else:
                print(f"Warning: Could not find Header for {display_name}")

        book_positions.sort()

        bible_data = []
        for i in range(len(book_positions)):
            start_p, b_name = book_positions[i]
            end_p = book_positions[i+1][0] if i+1 < len(book_positions) else len(content)
            
            book_text = content[start_p:end_p]
            current_book = {"book": b_name, "chapters": []}
            
            # Use regex split to get [junk, chapter, verse, text, chapter, verse, text...]
            parts = verse_pattern.split(book_text)
            for j in range(1, len(parts), 3):
                try:
                    c_num, v_num = int(parts[j]), int(parts[j+1])
                    v_text = re.sub(r'\s+', ' ', parts[j+2]).strip()
                    
                    if not current_book["chapters"] or current_book["chapters"][-1]["chapter"] != c_num:
                        current_book["chapters"].append({"chapter": c_num, "verses": []})
                    
                    current_book["chapters"][-1]["verses"].append({"verse": v_num, "text": v_text})
                except (ValueError, IndexError):
                    continue
            
            if current_book["chapters"]:
                bible_data.append(current_book)

        with open(output_file, 'w', encoding='utf-8') as out:
            out.write("export interface BibleVerse { verse: number; text: string; }\n")
            out.write("export interface BibleChapter { chapter: number; verses: BibleVerse[]; }\n")
            out.write("export interface BibleBook { book: string; chapters: BibleChapter[]; }\n\n")
            out.write(f"export const bibleBooks: BibleBook[] = {json.dumps(bible_data, indent=2)};\n\n")
            out.write("export const getAllChapters = () => bibleBooks.flatMap(b => b.chapters.map(c => ({ ...c, id: `${b.book}-${c.chapter}`, bookName: b.book })));")

        print(f"Done! Successfully processed {len(bible_data)} books.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    convert_bible_to_ts('bible.txt', 'bible-books.ts')