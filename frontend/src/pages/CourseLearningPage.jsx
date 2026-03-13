import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { progressService, quizAttemptService, quizService, resourceService } from '../services/api';

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
        <aside className="glass-card rounded-2xl p-4 shadow-glow">
          <h2 className="text-lg font-semibold text-primary">Lecture List</h2>
          <div className="mt-3 space-y-2">
            {lectures.map((lecture, idx) => (
              <button
                key={lecture.id}
                onClick={() => setActiveLectureIndex(idx)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  idx === activeLectureIndex ? 'bg-primary text-white' : 'bg-white/70 text-slate-700'
                }`}
              >
                {lecture.title}
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5 shadow-glow">
            <div className="mb-3 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-primary">{activeLecture?.title || 'No lecture selected'}</h1>
              <span className="text-sm text-slate-600">Progress {progressPercent}%</span>
            </div>
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-accent" style={{ width: `${progressPercent}%` }} />
            </div>

            {activeLecture?.content_url ? (
              <iframe
                title="Lecture player"
                src={toEmbedUrl(activeLecture.content_url)}
                className="h-[320px] w-full rounded-xl md:h-[420px]"
                allowFullScreen
              />
            ) : (
              <div className="rounded-xl bg-slate-100 p-8 text-center text-slate-600">No lecture URL available</div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={markCurrentCompleted} className="rounded-lg bg-accent px-4 py-2 text-sm text-white">
                Mark as Completed
              </button>
              <button
                onClick={() => setActiveLectureIndex((prev) => Math.min(prev + 1, Math.max(lectures.length - 1, 0)))}
                className="rounded-lg border border-primary px-4 py-2 text-sm text-primary"
              >
                Next Lecture
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="glass-card rounded-2xl p-4 shadow-glow">
          <h2 className="text-lg font-semibold text-primary">Course Quizzes</h2>
          <div className="mt-3 space-y-2">
            {quizzes.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => setActiveQuizId(quiz.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  quiz.id === activeQuizId ? 'bg-primary text-white' : 'bg-white/70 text-slate-700'
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
                <p className="text-sm text-slate-600">Timer: {activeQuiz.timer_minutes} mins</p>
              </div>

              {activeQuiz.questions?.map((q, idx) => (
                <div key={q.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-800">Q{idx + 1}. {q.question}</p>
                  <div className="mt-3 grid gap-2">
                    {(q.options_json || []).map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
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
                </div>
              ))}

              <button onClick={submitQuiz} className="rounded-lg bg-accent px-4 py-2 text-sm text-white">
                Submit Quiz
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 shadow-glow">
        <h2 className="text-lg font-semibold text-primary">Quiz Attempt History</h2>
        <div className="mt-3 space-y-2">
          {quizHistory.map((item) => (
            <div key={item.id} className="rounded-lg bg-white/70 p-3 text-sm">
              <p className="font-medium text-primary">{item.quiz?.title || 'Quiz'}</p>
              <p className="text-slate-600">
                Score: {item.score}/{item.total_questions}
              </p>
            </div>
          ))}
          {!quizHistory.length && <p className="text-sm text-slate-500">No attempts yet.</p>}
        </div>
      </div>
    </section>
  );
}

export default CourseLearningPage;
