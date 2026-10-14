import React, { useState } from 'react';
import { Vote, CheckCircle2, Award, Users, BarChart2 } from 'lucide-react';
import { Language, LocalArea, Poll } from '../types';
import { getLocalizedText } from '../data/mockData';
import { t } from '../translations';

interface PollsViewProps {
  polls: Poll[];
  onVote: (pollId: string, optionId: string) => void;
  language: Language;
  selectedArea: LocalArea;
  seniorCitizenMode?: boolean;
}

export const PollsView: React.FC<PollsViewProps> = ({
  polls,
  onVote,
  language,
  selectedArea,
  seniorCitizenMode,
}) => {
  const [selectedOptionByPoll, setSelectedOptionByPoll] = useState<Record<string, string>>({});

  const filteredPolls = polls.filter((p) => selectedArea === 'all' || p.area === selectedArea || p.area === 'all');

  const handleOptionSelect = (pollId: string, optionId: string) => {
    setSelectedOptionByPoll((prev) => ({ ...prev, [pollId]: optionId }));
  };

  const handleCastVoteClick = (pollId: string) => {
    const selectedOpt = selectedOptionByPoll[pollId];
    if (!selectedOpt) return;
    onVote(pollId, selectedOpt);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-purple-700/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 ring-4 ring-purple-500/10 shrink-0">
            <Vote className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {t(language, 'pollsHeading')}
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-2xl">
              {t(language, 'pollsSubheading')}
            </p>
          </div>
        </div>
      </div>

      {/* Polls Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPolls.map((poll) => {
          const userVotedOpt = poll.userVotedOptionId;
          const selectedForThisPoll = selectedOptionByPoll[poll.id] || userVotedOpt;

          return (
            <div
              key={poll.id}
              className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4 ${
                seniorCitizenMode ? 'text-base' : 'text-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 text-xs font-extrabold rounded-full uppercase">
                  📍 {poll.area === 'all' ? 'All Wards' : poll.area} • {poll.category}
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {t(language, 'totalVotesCount', { count: poll.totalVotes })}
                </span>
              </div>

              <div>
                <h3 className={`font-extrabold text-slate-900 ${seniorCitizenMode ? 'text-xl' : 'text-base'}`}>
                  {getLocalizedText(poll, 'title', language)}
                </h3>
                <p className="text-slate-600 mt-1">
                  {getLocalizedText(poll, 'description', language)}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {poll.options.map((opt) => {
                  const isSelected = selectedForThisPoll === opt.id;
                  const isVoted = userVotedOpt === opt.id;
                  const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;

                  return (
                    <div
                      key={opt.id}
                      className={`flex min-h-12 flex-col justify-center p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isVoted
                          ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-400'
                          : isSelected
                          ? 'bg-purple-50/60 border-purple-400'
                          : 'bg-slate-50 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`poll-${poll.id}`}
                            checked={isSelected}
                            disabled={!!userVotedOpt}
                            onChange={() => handleOptionSelect(poll.id, opt.id)}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <span>{getLocalizedText(opt, 'text', language)}</span>
                        </label>
                        {userVotedOpt && (
                          <span className="text-purple-800 font-extrabold">{pct}%</span>
                        )}
                      </div>

                      {/* Vote Progress Bar if voted */}
                      {userVotedOpt && (
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
                          <div className="h-full bg-purple-600 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Vote CTA */}
              {!userVotedOpt ? (
                <button
                  type="button"
                  disabled={!selectedOptionByPoll[poll.id]}
                  onClick={() => handleCastVoteClick(poll.id)}
                  className={`min-h-12 w-full py-3 rounded-xl font-extrabold shadow-md transition-all cursor-pointer ${
                    selectedOptionByPoll[poll.id]
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {t(language, 'castVoteBtn')}
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t(language, 'votedBadge')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
