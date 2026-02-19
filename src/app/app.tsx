import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { BibleContent, BibleContentHandle } from './components/BibleContent';
import { bibleBooks, getAllChapters } from './data/bible-books';

export default function App() {
  const [currentChapterId, setCurrentChapterId] = useState<string>();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const bibleContentRef = useRef<BibleContentHandle>(null);

  // OPTIMIZATION: Memoize chapters so they aren't recalculated on every render
  const chapters = useMemo(() => getAllChapters(), []);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (saved === 'dark' || (!saved && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => {
      const nextMode = !prev;
      if (nextMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return nextMode;
    });
  }, []);

  const handleChapterClick = useCallback((chapterId: string) => {
    setCurrentChapterId(chapterId);
    // Directly trigger the Virtualized list to avoid DOM searching
    if (bibleContentRef.current) {
      bibleContentRef.current.scrollToChapter(chapterId);
    }
  }, []);

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <Sidebar
        chapters={chapters}
        onChapterClick={handleChapterClick}
        currentChapterId={currentChapterId}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      <main className="flex-1 relative">
        <BibleContent 
          ref={bibleContentRef}
          books={bibleBooks} 
          highContrast={isDarkMode} 
        />
      </main>
    </div>
  );
}