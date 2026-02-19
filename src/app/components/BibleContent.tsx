interface BibleContentProps {
  verses: Record<string, string>;
  bookName?: string;
  chapterNum?: number;
}

export function BibleContent({ verses, bookName, chapterNum }: BibleContentProps) {
  const verseList = Object.entries(verses).sort((a, b) => Number(a[0]) - Number(b[0]));

  if (verseList.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground font-serif italic">
        Select a book and chapter to begin reading
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:px-12">
      <header className="mb-12 border-b border-border pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight text-foreground">
          {bookName}
        </h1>
        <h2 className="text-xl md:text-2xl font-serif text-muted-foreground uppercase tracking-widest">
          Chapter {chapterNum}
        </h2>
      </header>

      <div className="space-y-6">
        {verseList.map(([num, text]) => (
          <p 
            key={num} 
            className="text-lg md:text-xl leading-relaxed font-serif text-foreground/90"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        ))}
      </div>
      
      <div className="h-24" />
    </div>
  );
}