import { Pencil, PlusCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  type Book,
  type BookLoan,
  getLocalBooks,
  getLocalLoans,
  getLocalStudents,
  saveLocalBooks,
  saveLocalLoans,
} from "../../utils/sampleData";

function blankBook(): Book {
  return {
    id: "",
    title: "",
    author: "",
    isbn: "",
    category: "",
    copiesAvailable: 1,
    totalCopies: 1,
  };
}

const loanStatusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  returned: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
};

export function LibraryAdmin() {
  const [books, setBooks] = useState<Book[]>(getLocalBooks());
  const [loans, setLoans] = useState<BookLoan[]>(getLocalLoans());
  const [students] = useState(getLocalStudents());
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState<Book>(blankBook());
  const [editing, setEditing] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm(blankBook());
    setDialog(true);
  };
  const openEdit = (book: Book) => {
    setEditing(book.id);
    setForm({ ...book });
    setDialog(true);
  };

  const save = () => {
    let updated: Book[];
    if (editing) {
      updated = books.map((b) => (b.id === editing ? form : b));
    } else {
      updated = [...books, { ...form, id: `BK-${Date.now()}` }];
    }
    setBooks(updated);
    saveLocalBooks(updated);
    setDialog(false);
  };

  const processReturn = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;
    const updatedLoans = loans.map((l) =>
      l.id === loanId
        ? {
            ...l,
            status: "returned" as const,
            returnedAt: new Date().toISOString().split("T")[0],
          }
        : l,
    );
    setLoans(updatedLoans);
    saveLocalLoans(updatedLoans);
    const updatedBooks = books.map((b) =>
      b.id === loan.bookId
        ? {
            ...b,
            copiesAvailable: Math.min(b.totalCopies, b.copiesAvailable + 1),
          }
        : b,
    );
    setBooks(updatedBooks);
    saveLocalBooks(updatedBooks);
  };

  const activeLoans = loans.filter((l) => l.status !== "returned");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Library Management</h1>

      <Tabs defaultValue="books">
        <TabsList>
          <TabsTrigger value="books" data-ocid="library.tab">
            Books ({books.length})
          </TabsTrigger>
          <TabsTrigger value="loans" data-ocid="library.tab">
            Active Loans ({activeLoans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Book Catalog</CardTitle>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={openNew}
                data-ocid="library.open_modal_button"
              >
                <PlusCircle size={14} className="mr-1" /> Add Book
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table data-ocid="library.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>ISBN</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book, i) => (
                      <TableRow
                        key={book.id}
                        data-ocid={`library.row.${i + 1}`}
                      >
                        <TableCell className="font-medium text-sm">
                          {book.title}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {book.author}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-slate-100 text-slate-600 border-0 text-xs">
                            {book.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-500">
                          {book.isbn}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              book.copiesAvailable === 0
                                ? "text-red-600 font-semibold"
                                : "text-green-700 font-semibold"
                            }
                          >
                            {book.copiesAvailable}/{book.totalCopies}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => openEdit(book)}
                            data-ocid={`library.edit_button.${i + 1}`}
                          >
                            <Pencil size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Active &amp; Overdue Loans
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Borrowed</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeLoans.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-slate-400 py-8"
                          data-ocid="library.empty_state"
                        >
                          No active loans.
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeLoans.map((loan, i) => {
                        const student = students.find(
                          (s) => s.matricNumber === loan.studentMatric,
                        );
                        return (
                          <TableRow
                            key={loan.id}
                            data-ocid={`library.item.${i + 1}`}
                          >
                            <TableCell>
                              <p className="text-sm font-medium">
                                {student?.name ?? loan.studentMatric}
                              </p>
                              <p className="text-xs text-slate-500">
                                {loan.studentMatric}
                              </p>
                            </TableCell>
                            <TableCell className="text-sm">
                              {loan.bookTitle}
                            </TableCell>
                            <TableCell className="text-sm text-slate-500">
                              {loan.borrowedAt}
                            </TableCell>
                            <TableCell className="text-sm text-slate-500">
                              {loan.dueDate}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`border-0 ${loanStatusColors[loan.status]}`}
                              >
                                {loan.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-700 border-green-300"
                                onClick={() => processReturn(loan.id)}
                                data-ocid={`library.secondary_button.${i + 1}`}
                              >
                                Return
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent data-ocid="library.dialog">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Book" : "Add Book"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                data-ocid="library.input"
              />
            </div>
            <div className="col-span-2">
              <Label>Author</Label>
              <Input
                value={form.author}
                onChange={(e) =>
                  setForm((f) => ({ ...f, author: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>ISBN</Label>
              <Input
                value={form.isbn}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isbn: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Total Copies</Label>
              <Input
                type="number"
                min={1}
                value={form.totalCopies}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    totalCopies: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label>Available Copies</Label>
              <Input
                type="number"
                min={0}
                value={form.copiesAvailable}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    copiesAvailable: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialog(false)}
              data-ocid="library.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={save}
              data-ocid="library.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
