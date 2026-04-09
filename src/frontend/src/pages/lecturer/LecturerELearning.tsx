import {
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Pin,
  PlayCircle,
  Plus,
  Send,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { getLocalCourses, getLocalStudents } from "../../utils/sampleData";

interface VideoLecture {
  id: string;
  courseCode: string;
  title: string;
  chapter: string;
  duration: string;
  views: number;
  uploadedAt: string;
  status: "published" | "draft";
}

interface ForumPost {
  id: string;
  courseCode: string;
  author: string;
  authorRole: "student" | "lecturer";
  content: string;
  title: string;
  pinned: boolean;
  replies: number;
  timestamp: string;
  tags: string[];
}

interface Assignment {
  id: string;
  courseCode: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  submissions: number;
  graded: number;
}

const LS_VIDEOS = "unidigital_lec_videos";
const LS_FORUM = "unidigital_lec_forum";
const LS_ASSIGNMENTS = "unidigital_lec_assignments";

const SEED_VIDEOS: VideoLecture[] = [
  {
    id: "lv1",
    courseCode: "CSC201",
    title: "Introduction to Data Structures",
    chapter: "Week 1",
    duration: "45:20",
    views: 38,
    uploadedAt: "2024-01-15",
    status: "published",
  },
  {
    id: "lv2",
    courseCode: "CSC201",
    title: "Arrays and Linked Lists",
    chapter: "Week 1",
    duration: "52:10",
    views: 34,
    uploadedAt: "2024-01-17",
    status: "published",
  },
  {
    id: "lv3",
    courseCode: "CSC201",
    title: "Stacks and Queues",
    chapter: "Week 2",
    duration: "38:45",
    views: 21,
    uploadedAt: "2024-01-24",
    status: "published",
  },
  {
    id: "lv4",
    courseCode: "MAT101",
    title: "Differential Calculus Fundamentals",
    chapter: "Week 1",
    duration: "43:15",
    views: 29,
    uploadedAt: "2024-01-15",
    status: "published",
  },
  {
    id: "lv5",
    courseCode: "MAT101",
    title: "Integration Techniques",
    chapter: "Week 2",
    duration: "55:00",
    views: 18,
    uploadedAt: "2024-01-22",
    status: "draft",
  },
];

const SEED_FORUM: ForumPost[] = [
  {
    id: "fp1",
    courseCode: "CSC201",
    author: "Dr. Abubakar Musa",
    authorRole: "lecturer",
    content:
      "Welcome to CSC201! Please review the course syllabus posted under Materials.",
    title: "📌 Welcome & Course Guidelines",
    pinned: true,
    replies: 12,
    timestamp: "Jan 15, 2024",
    tags: ["announcement"],
  },
  {
    id: "fp2",
    courseCode: "CSC201",
    author: "Adaeze Okonkwo",
    authorRole: "student",
    content:
      "I'm struggling to determine the time complexity for nested loops...",
    title: "Help: Big-O for nested loops?",
    pinned: false,
    replies: 5,
    timestamp: "Feb 3, 2024",
    tags: ["question"],
  },
  {
    id: "fp3",
    courseCode: "MAT101",
    author: "Prof. Jimoh F.O",
    authorRole: "lecturer",
    content:
      "Mid-semester will cover Chapters 1–4. Differential calculus focus.",
    title: "📌 Mid-semester Exam Coverage",
    pinned: true,
    replies: 7,
    timestamp: "Mar 1, 2024",
    tags: ["announcement"],
  },
];

const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: "a1",
    courseCode: "CSC201",
    title: "Assignment 1: Array Implementation in C",
    description:
      "Implement array operations: insert, delete, search. Submit source code + report.",
    dueDate: "2024-02-10",
    maxScore: 100,
    submissions: 35,
    graded: 35,
  },
  {
    id: "a2",
    courseCode: "CSC201",
    title: "Assignment 2: Linked List Operations",
    description:
      "Implement singly and doubly linked list with all standard operations.",
    dueDate: "2024-02-24",
    maxScore: 100,
    submissions: 33,
    graded: 33,
  },
  {
    id: "a3",
    courseCode: "CSC201",
    title: "Assignment 3: Binary Tree Traversal",
    description:
      "Implement in-order, pre-order, and post-order traversal algorithms.",
    dueDate: "2024-03-15",
    maxScore: 100,
    submissions: 12,
    graded: 0,
  },
];

function load<T>(key: string, seed: T[]): T[] {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : seed;
  } catch {
    return seed;
  }
}

export function LecturerELearning() {
  const courses = getLocalCourses();
  const students = getLocalStudents();
  const [activeCourse, setActiveCourse] = useState(
    courses[0]?.code ?? "CSC201",
  );
  const [videos, setVideos] = useState<VideoLecture[]>(() =>
    load(LS_VIDEOS, SEED_VIDEOS),
  );
  const [forum, setForum] = useState<ForumPost[]>(() =>
    load(LS_FORUM, SEED_FORUM),
  );
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    load(LS_ASSIGNMENTS, SEED_ASSIGNMENTS),
  );

  const [videoDialog, setVideoDialog] = useState(false);
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [assignmentDialog, setAssignmentDialog] = useState(false);

  const [videoForm, setVideoForm] = useState({
    title: "",
    chapter: "Week 1",
    duration: "",
    status: "draft" as VideoLecture["status"],
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    pinned: false,
  });
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxScore: 100,
  });
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeFeedback, setGradeFeedback] = useState("");

  const courseVideos = videos.filter((v) => v.courseCode === activeCourse);
  const courseThreads = forum.filter((f) => f.courseCode === activeCourse);
  const courseAssignments = assignments.filter(
    (a) => a.courseCode === activeCourse,
  );
  const enrolledCount = students.length;

  const addVideo = () => {
    if (!videoForm.title) {
      toast.error("Title required");
      return;
    }
    const v: VideoLecture = {
      id: `lv${Date.now()}`,
      courseCode: activeCourse,
      title: videoForm.title,
      chapter: videoForm.chapter,
      duration: videoForm.duration || "–",
      views: 0,
      uploadedAt: new Date().toISOString().split("T")[0],
      status: videoForm.status,
    };
    const updated = [...videos, v];
    setVideos(updated);
    localStorage.setItem(LS_VIDEOS, JSON.stringify(updated));
    setVideoDialog(false);
    setVideoForm({
      title: "",
      chapter: "Week 1",
      duration: "",
      status: "draft",
    });
    toast.success("Video lecture added");
  };

  const deleteVideo = (id: string) => {
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    localStorage.setItem(LS_VIDEOS, JSON.stringify(updated));
    toast.success("Video removed");
  };

  const publishVideo = (id: string) => {
    const updated = videos.map((v) =>
      v.id === id ? { ...v, status: "published" as const } : v,
    );
    setVideos(updated);
    localStorage.setItem(LS_VIDEOS, JSON.stringify(updated));
    toast.success("Video published to students");
  };

  const postAnnouncement = () => {
    if (!announcementForm.title) {
      toast.error("Title required");
      return;
    }
    const fp: ForumPost = {
      id: `fp${Date.now()}`,
      courseCode: activeCourse,
      author: "Lecturer",
      authorRole: "lecturer",
      title: (announcementForm.pinned ? "📌 " : "") + announcementForm.title,
      content: announcementForm.content,
      pinned: announcementForm.pinned,
      replies: 0,
      timestamp: new Date().toLocaleDateString(),
      tags: ["announcement"],
    };
    const updated = [fp, ...forum];
    setForum(updated);
    localStorage.setItem(LS_FORUM, JSON.stringify(updated));
    setAnnouncementDialog(false);
    setAnnouncementForm({ title: "", content: "", pinned: false });
    toast.success("Announcement posted");
  };

  const pinThread = (id: string) => {
    const updated = forum.map((f) =>
      f.id === id ? { ...f, pinned: !f.pinned } : f,
    );
    setForum(updated);
    localStorage.setItem(LS_FORUM, JSON.stringify(updated));
  };

  const deleteThread = (id: string) => {
    const updated = forum.filter((f) => f.id !== id);
    setForum(updated);
    localStorage.setItem(LS_FORUM, JSON.stringify(updated));
    toast.success("Thread deleted");
  };

  const addAssignment = () => {
    if (!assignmentForm.title || !assignmentForm.dueDate) {
      toast.error("Title and due date required");
      return;
    }
    const a: Assignment = {
      id: `a${Date.now()}`,
      courseCode: activeCourse,
      title: assignmentForm.title,
      description: assignmentForm.description,
      dueDate: assignmentForm.dueDate,
      maxScore: assignmentForm.maxScore,
      submissions: 0,
      graded: 0,
    };
    const updated = [...assignments, a];
    setAssignments(updated);
    localStorage.setItem(LS_ASSIGNMENTS, JSON.stringify(updated));
    setAssignmentDialog(false);
    setAssignmentForm({
      title: "",
      description: "",
      dueDate: "",
      maxScore: 100,
    });
    toast.success("Assignment created");
  };

  const gradeAssignment = (id: string) => {
    const updated = assignments.map((a) =>
      a.id === id ? { ...a, graded: a.graded + 1 } : a,
    );
    setAssignments(updated);
    localStorage.setItem(LS_ASSIGNMENTS, JSON.stringify(updated));
    setGradingId(null);
    setGradeFeedback("");
    toast.success("Submission graded with feedback");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            E-Learning Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload videos, manage forums, and grade assignments.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setVideoDialog(true)}
            data-ocid="elearnmgmt.add_video_button"
          >
            <Video size={14} className="mr-1" /> Add Video
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAnnouncementDialog(true)}
            data-ocid="elearnmgmt.announce_button"
          >
            <MessageSquare size={14} className="mr-1" /> Announce
          </Button>
          <Button
            size="sm"
            onClick={() => setAssignmentDialog(true)}
            data-ocid="elearnmgmt.add_assignment_button"
          >
            <Plus size={14} className="mr-1" /> New Assignment
          </Button>
        </div>
      </div>

      {/* Course selector */}
      <div className="flex flex-wrap gap-2">
        {courses.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => setActiveCourse(c.code)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCourse === c.code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            data-ocid="elearnmgmt.tab"
          >
            {c.code}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-primary">
              {courseVideos.filter((v) => v.status === "published").length}
            </p>
            <p className="text-xs text-muted-foreground">Published Videos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-primary">
              {courseThreads.length}
            </p>
            <p className="text-xs text-muted-foreground">Forum Threads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-primary">
              {courseAssignments.length}
            </p>
            <p className="text-xs text-muted-foreground">Assignments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-primary">{enrolledCount}</p>
            <p className="text-xs text-muted-foreground">Enrolled Students</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="videos">
        <TabsList className="mb-4">
          <TabsTrigger value="videos" data-ocid="elearnmgmt.tab">
            <PlayCircle size={14} className="mr-1" /> Videos
          </TabsTrigger>
          <TabsTrigger value="forum" data-ocid="elearnmgmt.tab">
            <MessageSquare size={14} className="mr-1" /> Forum
          </TabsTrigger>
          <TabsTrigger value="assignments" data-ocid="elearnmgmt.tab">
            <BookOpen size={14} className="mr-1" /> Assignments
          </TabsTrigger>
          <TabsTrigger value="analytics" data-ocid="elearnmgmt.tab">
            <BarChart3 size={14} className="mr-1" /> Analytics
          </TabsTrigger>
        </TabsList>

        {/* Videos */}
        <TabsContent value="videos" className="space-y-3">
          {courseVideos.map((v, i) => (
            <Card key={v.id} data-ocid={`elearnmgmt.video.${i + 1}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <PlayCircle size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{v.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.chapter} • {v.duration} • {v.views} views • Uploaded{" "}
                    {v.uploadedAt}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    className={
                      v.status === "published"
                        ? "bg-green-100 text-green-700 border-0"
                        : "bg-amber-100 text-amber-700 border-0"
                    }
                  >
                    {v.status}
                  </Badge>
                  {v.status === "draft" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => publishVideo(v.id)}
                      data-ocid={`elearnmgmt.publish_button.${i + 1}`}
                    >
                      Publish
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => deleteVideo(v.id)}
                    data-ocid={`elearnmgmt.delete_button.${i + 1}`}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {courseVideos.length === 0 && (
            <Card>
              <CardContent
                className="p-12 text-center text-muted-foreground"
                data-ocid="elearnmgmt.empty_state"
              >
                No videos yet. Click "Add Video" to get started.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Forum */}
        <TabsContent value="forum" className="space-y-3">
          {[...courseThreads]
            .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
            .map((t, i) => (
              <Card
                key={t.id}
                className={t.pinned ? "border-primary/40" : ""}
                data-ocid={`elearnmgmt.thread.${i + 1}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {t.pinned && (
                          <Badge className="bg-primary/10 text-primary border-0 text-xs">
                            📌 Pinned
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {t.authorRole}
                        </Badge>
                        {t.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="font-semibold text-sm">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {t.author} • {t.timestamp}
                      </p>
                      <p className="text-xs text-foreground mt-1 line-clamp-2">
                        {t.content}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <span className="text-xs text-muted-foreground text-right">
                        <MessageSquare size={11} className="inline mr-0.5" />
                        {t.replies} replies
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs px-2"
                        onClick={() => pinThread(t.id)}
                        data-ocid={`elearnmgmt.pin_button.${i + 1}`}
                      >
                        <Pin size={11} className="mr-0.5" />
                        {t.pinned ? "Unpin" : "Pin"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs px-2 text-destructive"
                        onClick={() => deleteThread(t.id)}
                        data-ocid={`elearnmgmt.delete_button.${i + 1}`}
                      >
                        <Trash2 size={11} className="mr-0.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          {courseThreads.length === 0 && (
            <Card>
              <CardContent
                className="p-12 text-center text-muted-foreground"
                data-ocid="elearnmgmt.empty_state"
              >
                No forum activity yet. Post an announcement to get started.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Assignments */}
        <TabsContent value="assignments" className="space-y-4">
          {courseAssignments.map((a, i) => (
            <Card key={a.id} data-ocid={`elearnmgmt.assignment.${i + 1}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock size={11} /> Due: {a.dueDate} • Max: {a.maxScore}{" "}
                      marks
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-foreground font-medium">
                        {a.submissions} submitted
                      </span>
                      <span
                        className={
                          a.graded === a.submissions
                            ? "text-green-600 font-medium"
                            : "text-amber-600 font-medium"
                        }
                      >
                        {a.graded} graded{" "}
                        {a.graded < a.submissions &&
                          `(${a.submissions - a.graded} pending)`}
                      </span>
                    </div>
                  </div>
                  {a.graded < a.submissions && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setGradingId(a.id)}
                      data-ocid={`elearnmgmt.grade_button.${i + 1}`}
                    >
                      <CheckCircle size={13} className="mr-1" /> Grade
                    </Button>
                  )}
                </div>
                {gradingId === a.id && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <p className="text-xs font-semibold">
                      Provide feedback for pending submissions:
                    </p>
                    <Textarea
                      placeholder="Feedback for students..."
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      rows={2}
                      data-ocid="elearnmgmt.feedback_textarea"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => gradeAssignment(a.id)}
                        data-ocid="elearnmgmt.submit_grade_button"
                      >
                        <Send size={12} className="mr-1" /> Submit Grades
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setGradingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {courseAssignments.length === 0 && (
            <Card>
              <CardContent
                className="p-12 text-center text-muted-foreground"
                data-ocid="elearnmgmt.empty_state"
              >
                No assignments yet. Click "New Assignment" above.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 size={15} /> Video Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {courseVideos
                  .filter((v) => v.status === "published")
                  .map((v) => (
                    <div key={v.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate text-foreground">
                          {v.title}
                        </span>
                        <span className="text-muted-foreground flex-shrink-0 ml-2">
                          {v.views} views
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min((v.views / Math.max(enrolledCount, 1)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText size={15} /> Assignment Completion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {courseAssignments.map((a) => {
                  const pct =
                    enrolledCount > 0
                      ? Math.round((a.submissions / enrolledCount) * 100)
                      : 0;
                  return (
                    <div key={a.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate text-foreground">
                          {a.title.split(":")[0]}
                        </span>
                        <span className="text-muted-foreground flex-shrink-0 ml-2">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Course Engagement Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-muted rounded p-3">
                  <p className="text-xl font-bold text-primary">
                    {courseVideos.reduce((s, v) => s + v.views, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Video Views
                  </p>
                </div>
                <div className="bg-muted rounded p-3">
                  <p className="text-xl font-bold text-primary">
                    {courseAssignments.reduce((s, a) => s + a.submissions, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Submissions
                  </p>
                </div>
                <div className="bg-muted rounded p-3">
                  <p className="text-xl font-bold text-primary">
                    {courseThreads.reduce((s, t) => s + t.replies, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Forum Replies</p>
                </div>
                <div className="bg-muted rounded p-3">
                  <p className="text-xl font-bold text-primary">
                    {enrolledCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Video Dialog */}
      <Dialog open={videoDialog} onOpenChange={setVideoDialog}>
        <DialogContent data-ocid="elearnmgmt.video_dialog">
          <DialogHeader>
            <DialogTitle>Add Video Lecture</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1"
                value={videoForm.title}
                onChange={(e) =>
                  setVideoForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Week 3: Binary Trees"
                data-ocid="elearnmgmt.input"
              />
            </div>
            <div>
              <Label>Chapter / Week</Label>
              <Input
                className="mt-1"
                value={videoForm.chapter}
                onChange={(e) =>
                  setVideoForm((f) => ({ ...f, chapter: e.target.value }))
                }
                data-ocid="elearnmgmt.input"
              />
            </div>
            <div>
              <Label>Duration (e.g. 45:30)</Label>
              <Input
                className="mt-1"
                value={videoForm.duration}
                onChange={(e) =>
                  setVideoForm((f) => ({ ...f, duration: e.target.value }))
                }
                data-ocid="elearnmgmt.input"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={videoForm.status}
                onValueChange={(v) =>
                  setVideoForm((f) => ({
                    ...f,
                    status: v as VideoLecture["status"],
                  }))
                }
              >
                <SelectTrigger className="mt-1" data-ocid="elearnmgmt.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addVideo} data-ocid="elearnmgmt.submit_button">
              <Upload size={14} className="mr-1" /> Add Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Announcement Dialog */}
      <Dialog open={announcementDialog} onOpenChange={setAnnouncementDialog}>
        <DialogContent data-ocid="elearnmgmt.announce_dialog">
          <DialogHeader>
            <DialogTitle>Post Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1"
                value={announcementForm.title}
                onChange={(e) =>
                  setAnnouncementForm((f) => ({ ...f, title: e.target.value }))
                }
                data-ocid="elearnmgmt.input"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                className="mt-1"
                value={announcementForm.content}
                onChange={(e) =>
                  setAnnouncementForm((f) => ({
                    ...f,
                    content: e.target.value,
                  }))
                }
                rows={4}
                data-ocid="elearnmgmt.textarea"
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                checked={announcementForm.pinned}
                onChange={(e) =>
                  setAnnouncementForm((f) => ({
                    ...f,
                    pinned: e.target.checked,
                  }))
                }
              />
              Pin this announcement
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAnnouncementDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={postAnnouncement}
              data-ocid="elearnmgmt.post_button"
            >
              <Send size={14} className="mr-1" /> Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialog} onOpenChange={setAssignmentDialog}>
        <DialogContent data-ocid="elearnmgmt.assignment_dialog">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1"
                value={assignmentForm.title}
                onChange={(e) =>
                  setAssignmentForm((f) => ({ ...f, title: e.target.value }))
                }
                data-ocid="elearnmgmt.input"
              />
            </div>
            <div>
              <Label>Description / Instructions</Label>
              <Textarea
                className="mt-1"
                value={assignmentForm.description}
                onChange={(e) =>
                  setAssignmentForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                rows={3}
                data-ocid="elearnmgmt.textarea"
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                className="mt-1"
                type="date"
                value={assignmentForm.dueDate}
                onChange={(e) =>
                  setAssignmentForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                data-ocid="elearnmgmt.input"
              />
            </div>
            <div>
              <Label>Max Score</Label>
              <Input
                className="mt-1"
                type="number"
                value={assignmentForm.maxScore}
                onChange={(e) =>
                  setAssignmentForm((f) => ({
                    ...f,
                    maxScore: +e.target.value,
                  }))
                }
                data-ocid="elearnmgmt.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignmentDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={addAssignment}
              data-ocid="elearnmgmt.submit_button"
            >
              <Plus size={14} className="mr-1" /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
