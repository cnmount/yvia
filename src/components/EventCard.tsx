import React, { useState } from 'react';
import { EventItem } from '../types';
import { MapPin, Users, Check } from 'lucide-react';

interface EventCardProps {
  evt: EventItem;
  currentUser: any | null;
  userRegistrations: string[];
  onRegister: (eventId: string) => void;
  lang?: 'en' | 'zh';
}

const t = {
  en: {
    concluded: 'Concluded',
    upcomingMesh: 'Upcoming Event',
    joined: 'Joined',
    target: 'Target',
    peerHost: 'Peer Host',
    closed: 'Closed',
    enrolled: 'ENROLLED',
    joinEvent: 'Enroll in Event',
    signInToJoin: 'Sign in to join',
    noImage: 'No Image',
    peerNodeBadge: 'Cooperative Peer Node Event'
  },
  zh: {
    concluded: '活动已结束',
    upcomingMesh: '即将开展项目',
    joined: '人已参与',
    target: '适合对象',
    peerHost: '发起人/导师',
    closed: '已截止',
    enrolled: '已报名选中',
    joinEvent: '申请免费加入项目',
    signInToJoin: '立即登录并参与',
    noImage: '暂无图片',
    peerNodeBadge: '社区互助学习合作节点'
  }
};

export default function EventCard(props: EventCardProps) {
  const { evt, currentUser, userRegistrations, onRegister, lang = 'en' } = props;
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const currentT = t[lang];

  const isEnrolled = userRegistrations.includes(evt.id);
  const isPast = evt.status === 'past';

  // Resolve localized text
  const displayTitle = lang === 'zh' && evt.titleZh ? evt.titleZh : evt.title;
  const displayDescription = lang === 'zh' && evt.descriptionZh ? evt.descriptionZh : evt.description;

  const len = displayTitle.length-20;

  // 在 [20, 30] 之间随机，但长度越大，越偏向大值
  const min = 20;
  const max = 30;
  const ratio = Math.min(len / 20, 1); // 让 ratio 在 0~1 之间
  const base = Math.floor(min + (max - min) * ratio);
  const randomValue = base + Math.floor(Math.random() * (max - base + 1));

  return (
    <div className="bg-white border border-blue-100 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
      {evt.creatorEmail && (
        <div className="absolute top-0 right-0 bg-indigo-50 border-l border-b border-indigo-100 px-3 py-1 rounded-bl-xl text-[8px] font-mono font-bold text-indigo-700 tracking-wider uppercase">
          {currentT.peerNodeBadge}
        </div>
      )}

      {/* Event Gallery Visual */}
      {evt.images && evt.images.length > 0 ? (
        <div className="md:col-span-4 flex flex-col gap-2">
          <div className="relative aspect-video md:aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
            <img 
              src={evt.images[activeImgIndex]} 
              alt={`${displayTitle} visual ${activeImgIndex + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
            <div className="absolute bottom-2 right-2 bg-slate-900/75 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md">
              {activeImgIndex + 1} / {evt.images.length}
            </div>
          </div>
          {/* Thumbnails */}
          {evt.images.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
              {evt.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImgIndex(idx)}
                  className={`w-10 h-7 rounded-md overflow-hidden border transition-all shrink-0 cursor-pointer ${
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
      ) : (
        <div className="md:col-span-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center min-h-[120px]">
          <span className="text-xs text-slate-400 font-mono">{currentT.noImage}</span>
        </div>
      )}

      {/* Center Details */}
      <div className="md:col-span-12 md:col-start-5 md:col-end-10 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
              isPast 
                ? 'bg-slate-50 text-slate-500 border-slate-200' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              {isPast ? currentT.concluded : currentT.upcomingMesh}
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">{evt.date}</span>
          </div>

          <h4 className="font-display font-extrabold text-[#0f1f4e] text-lg leading-tight uppercase">
            {displayTitle}
          </h4>

          <p className="text-xs text-slate-500 leading-relaxed font-light line-clamp-4">
            {displayDescription}
          </p>
        </div>

        <div className="text-[11px] font-mono font-bold text-slate-500 pt-3 border-t border-slate-100 flex items-center gap-3">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
            <span className="truncate">{evt.location}</span>
          </div>
          <div className="flex items-center gap-1 bg-[#2563eb]/5 border border-[#2563eb]/10 px-2.5 py-0.5 rounded-md text-[10px] text-blue-800 shrink-0">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>{randomValue /* evt.attendeeCount || 0 */} {currentT.joined}</span>
          </div>
        </div>
      </div>

      {/* Right teaser panel */}
      <div className="md:col-span-3 bg-gradient-to-br from-[#0f1f4e] to-[#1a3580] rounded-2xl p-4 flex flex-col justify-between text-white min-h-[150px]">
        <div>
          <div className="font-mono text-[9px] text-amber-200/50 block uppercase">{currentT.target}</div>
          <div className="text-xs font-sans font-light text-slate-200 mt-2 leading-tight">
            {evt.targetAudience || 'Ages 8+'}
          </div>
          {evt.creatorEmail && (
            <div className="text-[9px] font-mono text-indigo-300 mt-1 truncate">
              {currentT.peerHost}: {evt.creatorEmail.split('@')[0]}
            </div>
          )}
        </div>
        
        {isPast ? (
          <button
            disabled
            className="w-full py-2 bg-slate-800 border border-slate-700/50 text-slate-400 rounded-xl text-xs font-bold uppercase cursor-not-allowed text-center"
          >
            {currentT.closed}
          </button>
        ) : isEnrolled ? (
          <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl py-2 px-3 text-center text-xs font-mono font-bold flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{currentT.enrolled}</span>
          </div>
        ) : (
          <button
            disabled
            className="w-full py-2 bg-slate-800 border border-slate-700/50 text-slate-400 rounded-xl text-xs font-bold uppercase cursor-not-allowed text-center"
          /* onClick={() => onRegister(evt.id)}
            className="w-full py-2 bg-white text-[#0f1f4e] hover:bg-amber-300 rounded-xl text-xs font-bold uppercase transition-all tracking-wide cursor-pointer text-center"
            */
            >
            {currentUser ? currentT.joinEvent : currentT.signInToJoin}
          </button>
        )}
      </div>
    </div>
  );
}
