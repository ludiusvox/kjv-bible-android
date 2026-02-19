import { useEffect, useState, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { BibleContent, BibleContentHandle } from './components/BibleContent';
import { bibleBooks, getAllChapters } from './data/bible-books';

export default function App() {
  const [currentChapterId, setCurrentChapterId] = useState<string>();
  const [highContrast, setHighContrast] = useState(false);
  const bibleContentRef = useRef<BibleContentHandle>(null);
  const chapters = getAllChapters();

  useEffect(() => {
    const saved = localStorage.getItem('bibleHighContrast');
    if (saved === 'true') setHighContrast(true);
  }, []);

  const handleChapterClick = (chapterId: string) => {
    setCurrentChapterId(chapterId);
    // Tell the virtualized list to scroll to the correct chapter index
    if (bibleContentRef.current) {
      bibleContentRef.current.scrollToChapter(chapterId);
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${highContrast ? 'bg-black' : 'bg-white'}`}>
      <Sidebar
        chapters={chapters}
        onChapterClick={handleChapterClick}
        currentChapterId={currentChapterId}
        highContrast={highContrast}
        onHighContrastChange={setHighContrast}
      />
      <main className="flex-1">
        <BibleContent 
          ref={bibleContentRef}
          books={bibleBooks} 
          highContrast={highContrast} 
        />
      </main>
    </div>
  );
}