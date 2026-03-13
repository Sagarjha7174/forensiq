import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { progressService, quizAttemptService, quizService, resourceService } from '../services/api';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedCard from '../components/ui/AnimatedCard';

function toEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  return url;
}

function CourseLearningPage() {
  const { courseId } = useParams();
  const [lectures, setLectures] = useState([]);
  const [activeLectureIndex, setActiveLectureIndex] = useState(0);
  const [progressRows, setProgressRows] = useState([]);

  const [quizzes, setQuizzes] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [answers, setAnswers] = useState({});

  const loadAll = async () => {
    try {
      const [resourcesRes, progressRes, quizzesRes, historyRes] = await Promise.all([
        resourceService.getResources({ course_id: courseId, type: 'lecture' }),
        progressService.getProgress(),
        quizService.getQuizzes({ course_id: courseId }),
        quizAttemptService.getHistory({ course_id: courseId })
      ]);
      setLectures(resourcesRes.data || []);
      setProgressRows(progressRes.data || []);
      setQuizzes(quizzesRes.data || []);
      setQuizHistory(historyRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load course details');
    }
  };

  useEffect(() => {
    loadAll();
  }, [courseId]);

  const activeLecture = lectures[activeLectureIndex];
  const completedIds = useMemo(() => new Set(progressRows.map((item) => item.resource_id)), [progressRows]);
  const completedCount = lectures.filter((lecture) => completedIds.has(lecture.id)).length;
  const progressPercent = lectures.length ? Math.round((completedCount / lectures.length) * 100) : 0;

  const activeQuiz = useMemo(() => quizzes.find((q) => q.id === activeQuizId) || null, [quizzes, activeQuizId]);

  const markCurrentCompleted = async () => {
    if (!activeLecture) return;
    try {
      await progressService.markCompleted({ resource_id: activeLecture.id });
      const refreshed = await progressService.getProgress();
      setProgressRows(refreshed.data || []);
      toast.success('Marked as completed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update progress');
    }
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    const payloadAnswers = activeQuiz.questions.map((q) => ({
      question_id: q.id,
      selected_option: answers[q.id] || ''
    }));

    try {
      const response = await quizAttemptService.submitAttempt({
        quiz_id: activeQuiz.id,
        answers: payloadAnswers
      });
      toast.success(
        `Score: ${response.data.result.score}/${response.data.result.total_questions} (${response.data.result.percentage}%)`
      );
      setAnswers({});
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    }
  };

  return (
    <section className="mt-8 space-y-6">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="glass-card rounded-2xl p-4 shadow-glow md:sticky md:top-24 md:h-fit">
          <h2 className="text-lg font-semibold text-primary">Lecture List</h2>
          <div className="mt-3 space-y-2">
            {lectures.map((lecture, idx) => (
              <button
                key={lecture.id}
                onClick={() => setActiveLectureIndex(idx)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  idx === activeLectureIndex
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-white/70 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <PlayCircle size={14} />
                  {lecture.title}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5 shadow-glow"
          >
            <div className="mb-3 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-primary">{activeLecture?.title || 'No lecture selected'}</h1>
              <span className="text-sm text-slate-600 dark:text-slate-300">Progress {progressPercent}%</span>
            </div>
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-primary to-accent"
              />
            </div>

            {activeLecture?.content_url ? (
              <iframe
                title="Lecture player"
                src={toEmbedUrl(activeLecture.content_url)}
                className="h-[320px] w-full rounded-xl md:h-[420px]"
                allowFullScreen
              />
            ) : (
              <div className="rounded-xl bg-slate-100 p-8 text-center text-slate-600 dark:bg-slate-900 dark:text-slate-300">No lecture URL available</div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <AnimatedButton onClick={markCurrentCompleted} variant="accent" icon={CheckCircle2}>
                Mark as Completed
              </AnimatedButton>
              <AnimatedButton
                onClick={() => setActiveLectureIndex((prev) => Math.min(prev + 1, Math.max(lectures.length - 1, 0)))}
                variant="ghost"
                icon={ChevronRight}
              >
                Next Lecture
              </AnimatedButton>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="glass-card rounded-2xl p-4 shadow-glow md:sticky md:top-24 md:h-fit">
          <h2 className="text-lg font-semibold text-primary">Course Quizzes</h2>
          <div className="mt-3 space-y-2">
            {quizzes.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => setActiveQuizId(quiz.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  quiz.id === activeQuizId
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-white/70 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {quiz.title}
              </button>
            ))}
            {!quizzes.length && <p className="text-sm text-slate-500">No quizzes for this course.</p>}
          </div>
        </aside>

        <div className="glass-card rounded-2xl p-5 shadow-glow">
          {!activeQuiz && <p className="text-slate-600">Select a quiz to start.</p>}
          {activeQuiz && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-primary">{activeQuiz.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Timer: {activeQuiz.timer_minutes} mins</p>
              </div>

              {activeQuiz.questions?.map((q, idx) => (
                <AnimatedCard key={q.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700" hover={false}>
                  <p className="font-medium text-slate-800 dark:text-slate-100">Q{idx + 1}. {q.question}</p>
                  <div className="mt-3 grid gap-2">
                    {(q.options_json || []).map((opt) => (
                      <label key={opt} className="flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-slate-100/70 dark:text-slate-200 dark:hover:bg-slate-800/80">
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </AnimatedCard>
              ))}

              <AnimatedButton onClick={submitQuiz} variant="accent">
                Submit Quiz
              </AnimatedButton>
            </div>
          )}
        </div>
      </div>

      <AnimatedCard className="p-5" hover={false}>
        <h2 className="text-lg font-semibold text-primary">Quiz Attempt History</h2>
        <div className="mt-3 space-y-2">
          {quizHistory.map((item) => (
            <div key={item.id} className="rounded-lg bg-white/70 p-3 text-sm dark:bg-slate-900/80">
              <p className="font-medium text-primary">{item.quiz?.title || 'Quiz'}</p>
              <p className="text-slate-600 dark:text-slate-300">
                Score: {item.score}/{item.total_questions}
              </p>
            </div>
          ))}
          {!quizHistory.length && <p className="text-sm text-slate-500">No attempts yet.</p>}
        </div>
      </AnimatedCard>
    </section>
  );
}

export default CourseLearningPage;
