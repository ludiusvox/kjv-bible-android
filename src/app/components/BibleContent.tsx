import { BibleBook } from '../data/bible-books';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useImperativeHandle, forwardRef, useRef, useMemo } from 'react';

interface BibleContentProps {
  books: BibleBook[];
  highContrast: boolean;
}

// This interface allows App.tsx to see this function
export interface BibleContentHandle {
  scrollToChapter: (chapterId: string) => void;
}

export const BibleContent = forwardRef<BibleContentHandle, BibleContentProps>(
  ({ books, highContrast }, ref) => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    // Flatten the Bible into a list of verses and remember where each chapter starts
    const { allVerses, chapterLookup } = useMemo(() => {
      const verses: any[] = [];
      const lookup: Record<string, number> = {};
      
      books.forEach((book) => {
        book.chapters.forEach((chapter) => {
          // Store the index where this specific chapter begins
          lookup[`${book.book}-${chapter.chapter}`] = verses.length;
          
          chapter.verses.forEach((verse, vIdx) => {
            verses.push({
              id: `${book.book}-${chapter.chapter}-${verse.verse}`,
              chapterId: `${book.book}-${chapter.chapter}`,
              bookName: book.book,
              chapterNum: chapter.chapter,
              verseNum: verse.verse,
              text: verse.text,
              isFirstInChapter: vIdx === 0,
            });
          });
        });
      });
      return { allVerses: verses, chapterLookup: lookup };
    }, [books]);

    // Expose the scroll function to the parent (App.tsx)
    useImperativeHandle(ref, () => ({
      scrollToChapter: (chapterId: string) => {
        const index = chapterLookup[chapterId];
        if (index !== undefined && virtuosoRef.current) {
          virtuosoRef.current.scrollToIndex({
            index,
            align: 'start',
            behavior: 'smooth'
          });
        }
      },
    }));

    return (
      <div className="h-screen w-full overflow-hidden">
        <Virtuoso
          ref={virtuosoRef}
          style={{ height: '100vh' }}
          data={allVerses}
          itemContent={(index, verse) => (
            <div className="max-w-3xl mx-auto px-4 md:px-8">
              {verse.isFirstInChapter && (
                <div className="mt-12 mb-6" id={verse.chapterId}>
                  {verse.chapterNum === 1 && (
                    <h2 className={`text-3xl md:text-4xl mb-8 pb-4 border-b-2 ${highContrast ? 'border-white text-white' : 'border-gray-300 text-gray-900'}`} style={{ fontFamily: "'Lora', serif" }}>
                      {verse.bookName}
                    </h2>
                  )}
                  <h3 className={`text-2xl md:text-3xl ${highContrast ? 'text-yellow-400' : 'text-gray-800'}`} style={{ fontFamily: "'Lora', serif" }}>
                    Chapter {verse.chapterNum}
                  </h3>
                </div>
              )}
              <p className={`text-base md:text-lg leading-relaxed py-2 ${highContrast ? 'text-white' : 'text-gray-800'}`} style={{ fontFamily: "'Crimson Text', serif" }}>
                <sup className={`text-sm mr-2 font-bold ${highContrast ? 'text-yellow-300' : 'text-gray-500'}`}>
                  {verse.verseNum}
                </sup>
                {verse.text}
              </p>
            </div>
          )}
        />
      </div>
    );
  }
);