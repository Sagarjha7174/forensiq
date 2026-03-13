import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { progressService, resourceService } from '../services/api';

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

  useEffect(() => {
    const load = async () => {
      try {
        const [resourcesRes, progressRes] = await Promise.all([
          resourceService.getResources({ course_id: courseId, type: 'lecture' }),
          progressService.getProgress()
        ]);
        setLectures(resourcesRes.data || []);
        setProgressRows(progressRes.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load lectures');
      }
    };

    load();
  }, [courseId]);

  const activeLecture = lectures[activeLectureIndex];
  const completedIds = useMemo(() => new Set(progressRows.map((item) => item.resource_id)), [progressRows]);
  const completedCount = lectures.filter((lecture) => completedIds.has(lecture.id)).length;
  const progressPercent = lectures.length ? Math.round((completedCount / lectures.length) * 100) : 0;

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

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
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
    </section>
  );
}

export default CourseLearningPage;
