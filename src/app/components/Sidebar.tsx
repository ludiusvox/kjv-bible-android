import { Menu, Search, X, ChevronRight, ChevronDown, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

interface ChapterReference {
  bookName: string;
  chapter: number;
  id: string;
}

interface SidebarProps {
  chapters: ChapterReference[];
  onChapterClick: (chapterId: string) => void;
  currentChapterId?: string;
  // NEW PROPS
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function Sidebar({ 
  chapters, 
  onChapterClick, 
  currentChapterId,
  isDarkMode,
  toggleTheme 
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBook, setExpandedBook] = useState<string | null>(
    currentChapterId ? currentChapterId.split('-')[0] : 'Genesis'
  );

  const groupedBooks = chapters.reduce((acc, chap) => {
    if (!acc[chap.bookName]) acc[chap.bookName] = [];
    acc[chap.bookName].push(chap);
    return acc;
  }, {} as Record<string, ChapterReference[]>);

  const filteredBooks = Object.keys(groupedBooks).filter(name => 
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-md shadow-md lg:hidden"
      >
        <Menu className="w-5 h-5 text-gray-600 dark:text-white" />
      </button>

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-black border-r border-gray-200 dark:border-white/10
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-gray-800 dark:text-white">Holy Bible</h2>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto pb-24">
            {filteredBooks.map((bookName) => (
              <div key={bookName} className="border-b border-gray-50 dark:border-white/5">
                <button
                  onClick={() => setExpandedBook(expandedBook === bookName ? null : bookName)}
                  className="w-full flex items-center justify-between py-3 text-left"
                >
                  <span className={`text-sm font-medium ${expandedBook === bookName ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    {bookName}
                  </span>
                  {expandedBook === bookName ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {expandedBook === bookName && (
                  <div className="grid grid-cols-5 gap-2 pb-4">
                    {groupedBooks[bookName].map((chapter) => (
                      <button
                        key={chapter.id}
                        onClick={() => {
                          onChapterClick(chapter.id);
                          if (window.innerWidth < 1024) setIsOpen(false);
                        }}
                        className={`aspect-square flex items-center justify-center text-xs rounded border ${
                          currentChapterId === chapter.id
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {chapter.chapter}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-black">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg shadow-lg"
            >
              {isDarkMode ? (
                <><Sun className="w-4 h-4" /> <span>Light Mode</span></>
              ) : (
                <><Moon className="w-4 h-4" /> <span>Dark Mode</span></>
              )}
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}