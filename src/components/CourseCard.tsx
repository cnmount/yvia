import React, { useState } from 'react';
import { Course } from '../types';
import { Check, Clock, ArrowRight } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onOpenRegistration: () => void;
  lang?: 'en' | 'zh';
}

const t = {
  en: {
    coreVariables: '[ Core Target Variables ]',
    requestNode: 'Request learning node',
  },
  zh: {
    coreVariables: '[ 核心学习目标 ]',
    requestNode: '申请社区课程节点',
  }
};

export default function CourseCard(props: CourseCardProps) {
  const { course, onOpenRegistration, lang = 'en' } = props;
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const currentT = t[lang];

  // Resolve localized text
  const displayTitle = lang === 'zh' && course.nameZh ? course.nameZh : course.name;
  const displayDescription = lang === 'zh' && course.descriptionZh ? course.descriptionZh : course.description;

  return (
    <div className="bg-white border border-blue-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#2563eb]/25 transition-all relative group h-full">
      <div className="space-y-4">
        {/* Gallery Visual with thumbnails */}
        {course.images && course.images.length > 0 && (
          <div className="space-y-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
              <img 
                src={course.images[activeImgIndex]} 
                alt={`${displayTitle} image ${activeImgIndex + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute bottom-2 right-2 bg-slate-900/75 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md">
                {activeImgIndex + 1} / {course.images.length}
              </div>
            </div>
            {/* Tiny Thumbnails */}
            {course.images.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {course.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIndex(idx)}
                    className={`w-12 h-8 rounded-lg overflow-hidden border transition-all shrink-0 cursor-pointer ${
                      activeImgIndex === idx 
                        ? 'border-[#2563eb] ring-2 ring-[#2563eb]/20 scale-102' 
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt="Thumbnail" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] bg-blue-50 border border-blue-200 text-[#2563eb] rounded-md px-2.5 py-1 font-bold">
            {course.id.toUpperCase()}
          </span>
          <span className="text-[11px] font-mono font-bold text-amber-500 bg-amber-50 rounded-full px-2.5 py-0.5">
            {course.ageGroup}
          </span>
        </div>

        <h3 className="font-display font-extrabold text-lg text-[#0f1f4e] line-clamp-1 border-b border-slate-100 pb-2">
          {displayTitle}
        </h3>

        <p className="text-xs text-slate-500 font-light leading-relaxed line-clamp-3">
          {displayDescription}
        </p>

        <div className="space-y-1 pt-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
            {currentT.coreVariables}
          </span>
          <ul className="space-y-1">
            {course.keyConcepts.slice(0, 4).map((concept, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-light">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{concept}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{course.duration}</span>
        </span>

        <button 
          onClick={onOpenRegistration}
          className="text-xs font-sans font-bold text-[#2563eb] flex items-center gap-1 hover:underline cursor-pointer uppercase tracking-tight"
        >
          <span>{currentT.requestNode}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
