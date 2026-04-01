import { BookOpen, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  type BookLoan,
  getLocalBooks,
  getLocalLoans,
  saveLocalBooks,
  saveLocalLoans,
} from "../../utils/sampleData";

interface Props {
  studentMatric: string;
}

const loanStatusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  returned: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
};

export function StudentLibrary({ studentMatric }: Props) {
  const [books, setBooks] = useState(getLocalBooks());
  const [loans, setLoans] = useState<BookLoan[]>(getLocalLoans());
  const [search, setSearch] = useState("");

  const myLoans = loans.filter((l) => l.studentMatric === studentMatric);
  const activeLoans = myLoans.filter(
    (l) => l.status === "active" || l.status === "overdue",
  );

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()),
  );

  const borrow = (bookId: string, bookTitle: string) => {
    const already = activeLoans.some((l) => l.bookId === bookId);
    if (already) return;
    const due = new Date();
    due.setDate(due.getDate() + 14);
    const newLoan: BookLoan = {
      id: `LOAN-${Date.now()}`,
      bookId,
      bookTitle,
      studentMatric,
      borrowedAt: new Date().toISOString().split("T")[0],
      dueDate: due.toISOString().split("T")[0],
      returnedAt: "",
      status: "active",
    };
    const updatedLoans = [...loans, newLoan];
    setLoans(updatedLoans);
    saveLocalLoans(updatedLoans);
    // reduce available copies
    const updatedBooks = books.map((b) =>
      b.id === bookId
        ? { ...b, copiesAvailable: Math.max(0, b.copiesAvailable - 1) }
        : b,
    );
    setBooks(updatedBooks);
    saveLocalBooks(updatedBooks);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Library</h1>

      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog" data-ocid="library.tab">
            Book Catalog
          </TabsTrigger>
          <TabsTrigger value="myloans" data-ocid="library.tab">
            My Loans ({myLoans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-4 space-y-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />
            <Input
              className="pl-9"
              placeholder="Search by title, author, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="library.search_input"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.map((book, i) => {
              const borrowed = activeLoans.some((l) => l.bookId === book.id);
              return (
                <Card key={book.id} data-ocid={`library.item.${i + 1}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">
                          {book.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {book.author}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">
                            {book.category}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {book.copiesAvailable}/{book.totalCopies} available
                          </span>
                        </div>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        {borrowed ? (
                          <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                            Borrowed
                          </Badge>
                        ) : book.copiesAvailable === 0 ? (
                          <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                            Unavailable
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 h-7 text-xs"
                            onClick={() => borrow(book.id, book.title)}
                            data-ocid={`library.primary_button.${i + 1}`}
                          >
                            Borrow
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="myloans" className="mt-4">
          {myLoans.length === 0 ? (
            <Card>
              <CardContent
                className="p-8 text-center text-slate-400"
                data-ocid="library.empty_state"
              >
                <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
                You have no loan history.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myLoans.map((loan, i) => (
                <Card key={loan.id} data-ocid={`library.item.${i + 1}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-slate-800">
                          {loan.bookTitle}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Borrowed: {loan.borrowedAt} &bull; Due: {loan.dueDate}
                        </p>
                        {loan.returnedAt && (
                          <p className="text-xs text-green-600 mt-0.5">
                            Returned: {loan.returnedAt}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={`border-0 ${loanStatusColors[loan.status]}`}
                      >
                        {loan.status.charAt(0).toUpperCase() +
                          loan.status.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
