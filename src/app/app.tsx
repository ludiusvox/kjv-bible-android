import { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BibleContent } from './components/BibleContent';

interface ActiveChapter {
  bookName: string;
  chapterNum: number;
  slug: string;
}

export default function App() {
  const [currentChapterData, setCurrentChapterData] = useState<Record<string, string>>({});
  const [activeChapter, setActiveChapter] = useState<ActiveChapter | null>(null);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleChapterLoaded = (verses: Record<string, string>, bookName: string, chapterNum: number, slug: string) => {
    setCurrentChapterData(verses);
    setActiveChapter({ bookName, chapterNum, slug });
  };

  return (
    /* Use 'bg-background' and 'text-foreground' from your theme.css */
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-300">
      <Sidebar
        onChapterDataLoaded={handleChapterLoaded}
        currentChapterId={activeChapter ? `${activeChapter.slug}-${activeChapter.chapterNum}` : undefined}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      <main className="flex-1 relative overflow-y-auto">
        <BibleContent 
          verses={currentChapterData} 
          bookName={activeChapter?.bookName}
          chapterNum={activeChapter?.chapterNum}
        />
      </main>
    </div>
  );
}