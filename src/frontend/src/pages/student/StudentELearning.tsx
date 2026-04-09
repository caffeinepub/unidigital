import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  FileText,
  MessageSquare,
  Play,
  PlayCircle,
  Send,
  ThumbsUp,
  Upload,
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
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { getLocalCourses } from "../../utils/sampleData";

interface VideoLecture {
  id: string;
  courseCode: string;
  title: string;
  duration: string;
  chapter: string;
  watched: boolean;
  bookmarked: boolean;
}

interface ForumThread {
  id: string;
  courseCode: string;
  title: string;
  author: string;
  replies: number;
  likes: number;
  pinned: boolean;
  lastActivity: string;
  content: string;
  tags: string[];
}

interface CourseProgress {
  courseCode: string;
  title: string;
  videosTotal: number;
  videosWatched: number;
  assignmentsTotal: number;
  assignmentsSubmitted: number;
  forumPosts: number;
  timeSpent: string;
}

const SEED_VIDEOS: VideoLecture[] = [
  {
    id: "v1",
    courseCode: "CSC201",
    title: "Introduction to Data Structures",
    duration: "45:20",
    chapter: "Week 1",
    watched: true,
    bookmarked: false,
  },
  {
    id: "v2",
    courseCode: "CSC201",
    title: "Arrays and Linked Lists Deep Dive",
    duration: "52:10",
    chapter: "Week 1",
    watched: true,
    bookmarked: true,
  },
  {
    id: "v3",
    courseCode: "CSC201",
    title: "Stacks, Queues & Deques",
    duration: "38:45",
    chapter: "Week 2",
    watched: false,
    bookmarked: false,
  },
  {
    id: "v4",
    courseCode: "CSC201",
    title: "Binary Trees and Traversal",
    duration: "61:30",
    chapter: "Week 3",
    watched: false,
    bookmarked: true,
  },
  {
    id: "v5",
    courseCode: "MAT101",
    title: "Differential Calculus Fundamentals",
    duration: "43:15",
    chapter: "Week 1",
    watched: true,
    bookmarked: false,
  },
  {
    id: "v6",
    courseCode: "MAT101",
    title: "Integration Techniques",
    duration: "55:00",
    chapter: "Week 2",
    watched: false,
    bookmarked: false,
  },
];

const SEED_THREADS: ForumThread[] = [
  {
    id: "t1",
    courseCode: "CSC201",
    title: "📌 Welcome & Course Guidelines",
    author: "Dr. Abubakar Musa",
    replies: 12,
    likes: 24,
    pinned: true,
    lastActivity: "2 hours ago",
    content:
      "Welcome to CSC201. Please review the course syllabus and post any questions here.",
    tags: ["announcement"],
  },
  {
    id: "t2",
    courseCode: "CSC201",
    title: "Help: Understanding Big-O notation for nested loops",
    author: "Adaeze Okonkwo",
    replies: 5,
    likes: 8,
    pinned: false,
    lastActivity: "1 day ago",
    content:
      "I'm struggling to determine the time complexity when we have nested for loops with different bounds...",
    tags: ["question", "algorithms"],
  },
  {
    id: "t3",
    courseCode: "CSC201",
    title: "Study group for Week 3 — anyone interested?",
    author: "Emeka Nwosu",
    replies: 9,
    likes: 14,
    pinned: false,
    lastActivity: "3 days ago",
    content:
      "Planning a virtual study session this weekend. Drop your availability below.",
    tags: ["study-group"],
  },
  {
    id: "t4",
    courseCode: "MAT101",
    title: "📌 Mid-semester exam coverage",
    author: "Prof. Jimoh F.O",
    replies: 7,
    likes: 31,
    pinned: true,
    lastActivity: "5 hours ago",
    content:
      "Mid-semester will cover Chapters 1–4. Focus on differential calculus applications.",
    tags: ["announcement", "exam"],
  },
  {
    id: "t5",
    courseCode: "MAT101",
    title: "Integration by parts — worked examples?",
    author: "Fatima Aliyu",
    replies: 3,
    likes: 5,
    pinned: false,
    lastActivity: "2 days ago",
    content:
      "Does anyone have extra worked examples for integration by parts? The textbook only has 2.",
    tags: ["question"],
  },
];

const SEED_PROGRESS: CourseProgress[] = [
  {
    courseCode: "CSC201",
    title: "Data Structures & Algorithms",
    videosTotal: 4,
    videosWatched: 2,
    assignmentsTotal: 3,
    assignmentsSubmitted: 2,
    forumPosts: 4,
    timeSpent: "6h 30m",
  },
  {
    courseCode: "MAT101",
    title: "General Mathematics I",
    videosTotal: 2,
    videosWatched: 1,
    assignmentsTotal: 2,
    assignmentsSubmitted: 1,
    forumPosts: 1,
    timeSpent: "3h 15m",
  },
];

const LS_KEY_THREADS = "unidigital_forum_threads";
const LS_KEY_VIDEOS = "unidigital_student_videos";

function getThreads(): ForumThread[] {
  try {
    const s = localStorage.getItem(LS_KEY_THREADS);
    return s ? JSON.parse(s) : SEED_THREADS;
  } catch {
    return SEED_THREADS;
  }
}
function getVideos(): VideoLecture[] {
  try {
    const s = localStorage.getItem(LS_KEY_VIDEOS);
    return s ? JSON.parse(s) : SEED_VIDEOS;
  } catch {
    return SEED_VIDEOS;
  }
}

interface Props {
  userEmail: string;
}

export function StudentELearning({ userEmail: _userEmail }: Props) {
  const courses = getLocalCourses();
  const [videos, setVideos] = useState<VideoLecture[]>(getVideos);
  const [threads, setThreads] = useState<ForumThread[]>(getThreads);
  const [activeCourse, setActiveCourse] = useState(
    courses[0]?.code ?? "CSC201",
  );
  const [playingVideo, setPlayingVideo] = useState<VideoLecture | null>(null);
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [newPost, setNewPost] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [assignmentFile, setAssignmentFile] = useState("");

  const courseVideos = videos.filter((v) => v.courseCode === activeCourse);
  const courseThreads = threads.filter((t) => t.courseCode === activeCourse);
  const progress = SEED_PROGRESS.find((p) => p.courseCode === activeCourse);
  const progressPct = progress
    ? Math.round(
        ((progress.videosWatched + progress.assignmentsSubmitted) /
          (progress.videosTotal + progress.assignmentsTotal)) *
          100,
      )
    : 0;

  const markWatched = (id: string) => {
    const updated = videos.map((v) =>
      v.id === id ? { ...v, watched: true } : v,
    );
    setVideos(updated);
    localStorage.setItem(LS_KEY_VIDEOS, JSON.stringify(updated));
    toast.success("Marked as watched");
  };

  const toggleBookmark = (id: string) => {
    const updated = videos.map((v) =>
      v.id === id ? { ...v, bookmarked: !v.bookmarked } : v,
    );
    setVideos(updated);
    localStorage.setItem(LS_KEY_VIDEOS, JSON.stringify(updated));
  };

  const likeThread = (id: string) => {
    const updated = threads.map((t) =>
      t.id === id ? { ...t, likes: t.likes + 1 } : t,
    );
    setThreads(updated);
    localStorage.setItem(LS_KEY_THREADS, JSON.stringify(updated));
  };

  const postReply = (threadId: string) => {
    if (!newPost.trim()) return;
    const updated = threads.map((t) =>
      t.id === threadId
        ? { ...t, replies: t.replies + 1, lastActivity: "Just now" }
        : t,
    );
    setThreads(updated);
    localStorage.setItem(LS_KEY_THREADS, JSON.stringify(updated));
    setNewPost("");
    toast.success("Reply posted!");
  };

  const createThread = () => {
    if (!newPostTitle.trim()) {
      toast.error("Thread title required");
      return;
    }
    const thread: ForumThread = {
      id: `t${Date.now()}`,
      courseCode: activeCourse,
      title: newPostTitle,
      author: "Me (Student)",
      replies: 0,
      likes: 0,
      pinned: false,
      lastActivity: "Just now",
      content: newPost,
      tags: ["discussion"],
    };
    const updated = [thread, ...threads];
    setThreads(updated);
    localStorage.setItem(LS_KEY_THREADS, JSON.stringify(updated));
    setNewPostTitle("");
    setNewPost("");
    setShowNewPost(false);
    toast.success("Thread created!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          E-Learning Portal
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Access video lectures, course materials, forums, and assignments.
        </p>
      </div>

      {/* Course Selector */}
      <div className="flex flex-wrap gap-2">
        {courses.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => setActiveCourse(c.code)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCourse === c.code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            data-ocid="elearning.tab"
          >
            {c.code}
          </button>
        ))}
      </div>

      {/* Progress Card */}
      {progress && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-sm">{progress.title}</p>
                <p className="text-xs text-muted-foreground">Course Progress</p>
              </div>
              <span className="text-2xl font-bold text-primary">
                {progressPct}%
              </span>
            </div>
            <Progress value={progressPct} className="h-2 mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="bg-muted rounded p-2">
                <p className="font-bold text-foreground">
                  {progress.videosWatched}/{progress.videosTotal}
                </p>
                <p className="text-muted-foreground">Videos</p>
              </div>
              <div className="bg-muted rounded p-2">
                <p className="font-bold text-foreground">
                  {progress.assignmentsSubmitted}/{progress.assignmentsTotal}
                </p>
                <p className="text-muted-foreground">Assignments</p>
              </div>
              <div className="bg-muted rounded p-2">
                <p className="font-bold text-foreground">
                  {progress.forumPosts}
                </p>
                <p className="text-muted-foreground">Forum Posts</p>
              </div>
              <div className="bg-muted rounded p-2">
                <p className="font-bold text-foreground">
                  {progress.timeSpent}
                </p>
                <p className="text-muted-foreground">Time Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="videos">
        <TabsList className="mb-4">
          <TabsTrigger value="videos" data-ocid="elearning.nav">
            <PlayCircle size={14} className="mr-1" /> Video Lectures
          </TabsTrigger>
          <TabsTrigger value="forum" data-ocid="elearning.nav">
            <MessageSquare size={14} className="mr-1" /> Forum
          </TabsTrigger>
          <TabsTrigger value="materials" data-ocid="elearning.nav">
            <FileText size={14} className="mr-1" /> Materials
          </TabsTrigger>
          <TabsTrigger value="assignments" data-ocid="elearning.nav">
            <BookOpen size={14} className="mr-1" /> Assignments
          </TabsTrigger>
        </TabsList>

        {/* Video Lectures Tab */}
        <TabsContent value="videos" className="space-y-4">
          {playingVideo && (
            <Card className="border-primary">
              <CardContent className="p-0">
                <div className="bg-muted aspect-video rounded-t-lg flex items-center justify-center relative">
                  <div className="text-center">
                    <Play
                      size={48}
                      className="text-primary mx-auto mb-2 opacity-60"
                    />
                    <p className="text-foreground font-semibold">
                      {playingVideo.title}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Duration: {playingVideo.duration}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      [Simulated Video Player — actual video would stream here]
                    </p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{playingVideo.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {playingVideo.chapter} • {playingVideo.duration}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleBookmark(playingVideo.id)}
                    >
                      {videos.find((v) => v.id === playingVideo.id)?.bookmarked
                        ? "★ Bookmarked"
                        : "☆ Bookmark"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        markWatched(playingVideo.id);
                        setPlayingVideo(null);
                      }}
                    >
                      <CheckCircle size={14} className="mr-1" /> Mark Watched
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPlayingVideo(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Group by chapter */}
          {Array.from(new Set(courseVideos.map((v) => v.chapter))).map(
            (chapter) => (
              <div key={chapter}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                  <ChevronRight size={14} /> {chapter}
                </h3>
                <div className="space-y-2">
                  {courseVideos
                    .filter((v) => v.chapter === chapter)
                    .map((video, i) => (
                      <Card
                        key={video.id}
                        className={video.watched ? "opacity-75" : ""}
                        data-ocid={`elearning.video.${i + 1}`}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${video.watched ? "bg-green-100" : "bg-primary/10"}`}
                          >
                            {video.watched ? (
                              <CheckCircle
                                size={18}
                                className="text-green-600"
                              />
                            ) : (
                              <Play size={18} className="text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {video.title}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock size={11} /> {video.duration}
                              </span>
                              {video.bookmarked && (
                                <span className="text-xs text-amber-500">
                                  ★ Bookmarked
                                </span>
                              )}
                              {video.watched && (
                                <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                  Watched
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={video.watched ? "outline" : "default"}
                            onClick={() => setPlayingVideo(video)}
                            data-ocid={`elearning.play_button.${i + 1}`}
                          >
                            <Play size={13} className="mr-1" />{" "}
                            {video.watched ? "Rewatch" : "Watch"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ),
          )}

          {courseVideos.length === 0 && (
            <Card>
              <CardContent
                className="p-12 text-center text-muted-foreground"
                data-ocid="elearning.empty_state"
              >
                No video lectures available for this course yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Forum Tab */}
        <TabsContent value="forum" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {courseThreads.length} threads in this course
            </p>
            <Button
              size="sm"
              onClick={() => setShowNewPost(true)}
              data-ocid="elearning.new_thread_button"
            >
              <MessageSquare size={13} className="mr-1" /> New Thread
            </Button>
          </div>

          {showNewPost && (
            <Card className="border-primary">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">New Discussion Thread</h3>
                <Input
                  placeholder="Thread title..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  data-ocid="elearning.input"
                />
                <Textarea
                  placeholder="Describe your question or topic..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={3}
                  data-ocid="elearning.textarea"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={createThread}
                    data-ocid="elearning.submit_button"
                  >
                    <Send size={13} className="mr-1" /> Post
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNewPost(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pinned first */}
          {[...courseThreads]
            .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
            .map((thread, i) => (
              <Card
                key={thread.id}
                className={thread.pinned ? "border-primary/40" : ""}
                data-ocid={`elearning.thread.${i + 1}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {thread.pinned && (
                          <Badge className="bg-primary/10 text-primary border-0 text-xs">
                            📌 Pinned
                          </Badge>
                        )}
                        {thread.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="font-semibold text-sm mt-1 cursor-pointer hover:text-primary text-left w-full"
                        onClick={() =>
                          setExpandedThread(
                            expandedThread === thread.id ? null : thread.id,
                          )
                        }
                      >
                        {thread.title}
                      </button>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        by {thread.author} • {thread.lastActivity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                      <span>
                        <MessageSquare size={12} className="inline mr-0.5" />
                        {thread.replies}
                      </span>
                      <button
                        type="button"
                        onClick={() => likeThread(thread.id)}
                        className="flex items-center gap-0.5 hover:text-primary transition-colors"
                        data-ocid={`elearning.like_button.${i + 1}`}
                      >
                        <ThumbsUp size={12} />
                        {thread.likes}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedThread(
                            expandedThread === thread.id ? null : thread.id,
                          )
                        }
                      >
                        {expandedThread === thread.id ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedThread === thread.id && (
                    <div className="mt-3 pt-3 border-t space-y-3">
                      <p className="text-sm text-foreground">
                        {thread.content}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          rows={2}
                          className="flex-1"
                          data-ocid="elearning.reply_textarea"
                        />
                        <Button
                          size="sm"
                          className="self-end"
                          onClick={() => postReply(thread.id)}
                          data-ocid="elearning.reply_button"
                        >
                          <Send size={13} />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

          {courseThreads.length === 0 && (
            <Card>
              <CardContent
                className="p-12 text-center text-muted-foreground"
                data-ocid="elearning.empty_state"
              >
                No discussions yet. Start the first thread!
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-3">
          {[
            {
              title: "Introduction to Data Structures — Slides",
              type: "PDF",
              size: "2.4 MB",
              date: "Jan 15",
            },
            {
              title: "Algorithm Analysis Notes",
              type: "PDF",
              size: "1.1 MB",
              date: "Jan 22",
            },
            {
              title: "Week 3 Reading List",
              type: "Link",
              size: "—",
              date: "Feb 2",
            },
            {
              title: "Midterm Review Sheet",
              type: "PDF",
              size: "0.9 MB",
              date: "Mar 1",
            },
          ].map((m, mIdx) => (
            <Card key={m.title} data-ocid={`elearning.material.${m.title}`}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.type} • {m.size} • Uploaded {m.date}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  data-ocid={`elearning.download_button.${mIdx + 1}`}
                >
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          {[
            {
              title: "Assignment 1: Array Implementation in C",
              due: "Feb 10, 2024",
              status: "submitted",
              grade: "85/100",
              feedback:
                "Good implementation. Consider edge cases for empty arrays.",
            },
            {
              title: "Assignment 2: Linked List Operations",
              due: "Feb 24, 2024",
              status: "submitted",
              grade: "90/100",
              feedback: "Excellent work! Recursive solution was elegant.",
            },
            {
              title: "Assignment 3: Binary Tree Traversal",
              due: "Mar 15, 2024",
              status: "pending",
              grade: null,
              feedback: null,
            },
          ].map((a, aIdx) => (
            <Card key={a.title} data-ocid={`elearning.assignment.${a.title}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock size={11} /> Due: {a.due}
                    </p>
                    {a.feedback && (
                      <div className="mt-2 bg-muted rounded p-2 text-xs">
                        <p className="font-medium text-foreground mb-0.5">
                          Feedback:
                        </p>
                        <p className="text-muted-foreground">{a.feedback}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      className={
                        a.status === "submitted"
                          ? "bg-green-100 text-green-700 border-0"
                          : "bg-amber-100 text-amber-700 border-0"
                      }
                    >
                      {a.status === "submitted" ? "✓ Submitted" : "Pending"}
                    </Badge>
                    {a.grade && (
                      <span className="text-sm font-bold text-primary">
                        {a.grade}
                      </span>
                    )}
                    {a.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Input
                          className="h-7 text-xs w-32"
                          placeholder="File URL..."
                          value={assignmentFile}
                          onChange={(e) => setAssignmentFile(e.target.value)}
                          data-ocid={`elearning.file_input.${aIdx + 1}`}
                        />
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            toast.success("Assignment submitted!");
                            setAssignmentFile("");
                          }}
                          data-ocid={`elearning.submit_button.${aIdx + 1}`}
                        >
                          <Upload size={11} className="mr-1" /> Submit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
